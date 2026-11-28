/* Content: the stored form of each item, as the document its tool reads, and the text of the files beside the items. A document is asked for when a tool first needs it and kept until the backend says it changed. The documents of the ontology models are read with the project, because the hierarchy shows what they hold: the attributes and the places of the entity types. */
import { fromBinary } from '@bufbuild/protobuf';
import { Refused } from '../backend';
import type { EntityContent, OntologyDocument } from '../documents';
import { Content, ContentChangesSchema, type Document } from '../gen/adp/storage/v1/content_pb';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import type { Link } from '../link';
import type { DeepReadonly, Done, FileText, Item, Relation, Writable } from '../views';
import type { CatalogueStore } from './catalogue';
import type { SolutionStore } from './solution';

interface Held { revision: number; text: string; parsed: unknown }

const hold = (d: { revision: number; text: string }, json: boolean): Held => {
  let parsed: unknown = null;
  if (json && d.text) try { parsed = JSON.parse(d.text); } catch { /* not a document a tool can read: it shows as empty */ }
  return { revision: d.revision, text: d.text, parsed };
};

export class ContentStore {
  revision = 0;
  private readonly docs = new Map<string, Held>();
  private readonly files = new Map<string, FileText>();
  private readonly asked = new Set<string>();
  private readonly arrivals = new Set<() => void>();
  private arrived = false;

  constructor(private readonly link: Link, private readonly projectId: string, private readonly solution: SolutionStore, private readonly catalogue: CatalogueStore) {
    link.listen('Content', projectId, event => this.apply(event), () => this.reload());
  }

  /* reads the documents the hierarchy shows */
  async load(): Promise<void> {
    await Promise.all(this.models().map(async m => { this.keep(await this.read(m.id)); }));
    this.show();
  }

  /* An item's document as its tool reads it: undefined while it is on its way, null when nothing was written yet. Asking starts the reading; onArrive tells when it is there. */
  doc<T>(x: Item): DeepReadonly<T> | null | undefined {
    const held = this.docs.get(x.id);
    if (held) return held.parsed as DeepReadonly<T> | null;
    this.fetch(x.id, () => this.read(x.id).then(d => { this.keep(d); }));
    return undefined;
  }
  /* an item's stored form as the text an editor shows; undefined while it is on its way */
  text(x: Item): string | undefined { this.doc(x); return this.docs.get(x.id)?.text; }
  /* the text of a file beside the items, by the item it belongs to and its path from there; undefined while it is on its way */
  file(owner: Item, path: string): FileText | undefined {
    const key = owner.id + '/' + path, held = this.files.get(key);
    if (held) return held;
    this.fetch(key, async () => {
      const f = await this.link.call(Content.method.readFile, { projectId: this.projectId, ownerId: owner.id, path });
      this.files.set(key, { text: f.text, holds: f.holds, syntax: f.syntax });
    });
    return undefined;
  }
  /* told when something that was asked for is there */
  onArrive(listener: () => void): () => void { this.arrivals.add(listener); return () => { this.arrivals.delete(listener); }; }

  /* Writes an item's document. touched names the item that shows as changed when it is not the one that holds the document, as an entity type inside its model. When somebody else wrote in between, it is refused and the document is read again. */
  async write(x: Item, doc: unknown, touched?: Item): Promise<Done> {
    try {
      return await this.link.call(Content.method.write, { projectId: this.projectId, itemId: x.id, baseRevision: this.docs.get(x.id)?.revision ?? 0, text: typeof doc === 'string' ? doc : JSON.stringify(doc), touchedId: touched?.id ?? '' });
    } catch (e) {
      if (e instanceof Refused && e.code === 'conflict') { this.docs.delete(x.id); this.refresh(); }
      throw e;
    }
  }

  private read(itemId: string): Promise<Document> { return this.link.call(Content.method.read, { projectId: this.projectId, itemId }); }
  private json(itemId: string): boolean { const x = this.solution.byId(itemId); return !x || this.catalogue.kind(x.kind).tool !== 'code'; }
  private keep(d: Document): boolean {
    const was = this.docs.get(d.itemId);
    if (was && was.revision > d.revision) return false;
    this.docs.set(d.itemId, hold(d, this.json(d.itemId)));
    return !was || was.text !== d.text;
  }
  private models(): Item[] { return [...this.solution.all()].filter(x => this.catalogue.kind(x.kind).tool === 'onto'); }

  private fetch(key: string, run: () => Promise<void>): void {
    if (this.asked.has(key)) return;
    this.asked.add(key);
    run().catch(() => undefined).finally(() => {
      this.asked.delete(key);
      if (this.arrived) return;
      this.arrived = true;
      queueMicrotask(() => { this.arrived = false; for (const l of [...this.arrivals]) l(); });
    });
  }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    const gap = event.revision !== this.revision + 1, changes = fromBinary(ContentChangesSchema, event.changes);
    this.revision = event.revision;
    /* a file's text follows from the items, so any change may have changed it */
    this.files.clear();
    if (changes.allStale || gap) this.docs.clear(); else for (const id of changes.stale) this.docs.delete(id);
    for (const d of changes.written) this.keep(d);
    this.show();
    this.refresh();
  }
  private async reload(): Promise<void> {
    this.docs.clear(); this.files.clear();
    await this.load();
  }
  /* reads again what the hierarchy shows and is no longer held; the page is told when that changed what it shows */
  private refresh(): void {
    const missing = this.models().filter(m => !this.docs.has(m.id) && !this.asked.has(m.id));
    if (!missing.length) return;
    for (const m of missing) this.asked.add(m.id);
    void Promise.all(missing.map(m => this.read(m.id).then(d => this.keep(d), () => false).finally(() => this.asked.delete(m.id)))).then(changed => {
      const before = this.shown();
      this.show();
      if (changed.some(Boolean) && before !== this.shown()) this.link.tell();
    });
  }

  /* puts what the documents of the models hold onto the items: the relations on a model, and on each entity type its attributes and its place */
  private show(): void {
    for (const m of this.models() as Writable<Item>[]) {
      const doc = this.docs.get(m.id)?.parsed as OntologyDocument | null | undefined;
      if (doc === undefined) continue;
      const entities = doc?.entities ?? {}, item = (id: string): Item | undefined => this.solution.byId(id);
      m.rels = (doc?.relations ?? []).flatMap(([a, b, label]): Relation[] => { const from = item(a), to = item(b); return from && to ? [[from, to, label]] : []; });
      for (const e of (m.children ?? []) as Writable<Item>[]) {
        const c: EntityContent = entities[e.id] ?? { attrs: [] };
        e.attrs = c.attrs;
        /* where nobody said, the first two attributes are the required ones */
        e.req = c.req ?? c.attrs.map((_, i) => i < 2);
        e.ext = c.ext; e.ex = c.x; e.ey = c.y;
      }
    }
  }
  private shown(): string { return this.models().map(m => this.docs.get(m.id)?.text ?? '').join('\u0000'); }
}
