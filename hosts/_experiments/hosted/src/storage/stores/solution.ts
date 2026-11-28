/* The solution: the hierarchy of a project. It holds one object per item for as long as the item exists, and brings it up to date when the backend tells of a change. */
import { fromBinary } from '@bufbuild/protobuf';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import { Solution, SolutionChangesSchema, type Item as Kept } from '../gen/adp/storage/v1/solution_pb';
import { newCallId } from '../ids';
import type { Link } from '../link';
import type { Done, Item, Writable } from '../views';

type Live = Writable<Item>;
export interface Added extends Done { readonly item: Item }
/* what a delete answers: with its words, the name History takes it back by */
export interface Removed extends Done { readonly undo: string }

export class SolutionStore {
  root!: Item;
  /* the folder the project is in */
  path = '';
  /* a repository to offer when one is linked in, the name to show it by, and the level it usually goes into */
  suggestedLink: { repo: string; name: string; refs: readonly string[]; parent: Item | null } = { repo: '', name: '', refs: [], parent: null };
  revision = 0;
  private readonly live = new Map<string, Live>();
  /* an item that is gone keeps its object, so it is the same one when it comes back */
  private readonly gone = new Map<string, Live>();

  constructor(private readonly link: Link, private readonly projectId: string, private readonly resync: () => void) {
    link.listen('Solution', projectId, event => this.apply(event), () => this.load());
  }

  async load(): Promise<void> {
    const s = await this.link.call(Solution.method.read, { projectId: this.projectId });
    this.take(s.items);
    this.drop([...this.live.keys()].filter(id => !s.items.some(x => x.id === id)));
    this.root = this.must(s.rootId);
    this.path = s.path;
    this.suggestedLink = { repo: s.suggestedLink?.repository ?? '', name: s.suggestedLinkName, refs: s.suggestedLink?.refs ?? [], parent: this.byId(s.suggestedLinkParentId) ?? null };
    this.revision = s.revision;
  }

  byId(id: string): Item | undefined { return this.live.get(id); }
  /* every item there is, in no order */
  all(): IterableIterator<Item> { return this.live.values(); }
  /* true while an item is part of the hierarchy */
  has(x: Item): boolean { return this.live.get(x.id) === x; }

  async add(parent: Item, kind: string): Promise<Added> {
    const r = await this.link.call(Solution.method.add, { projectId: this.projectId, parentId: parent.id, kind });
    return { item: this.must(r.itemId), message: r.message };
  }
  rename(x: Item, name: string): Promise<Done> { return this.link.call(Solution.method.rename, { projectId: this.projectId, itemId: x.id, name }); }
  async remove(x: Item): Promise<Removed> {
    const id = newCallId(), done = await this.link.call(Solution.method.delete, { projectId: this.projectId, itemId: x.id }, id);
    return { message: done.message, undo: id };
  }
  /* an empty name gives the item the icon of its kind again */
  setIcon(x: Item, icon: string): Promise<Done> { return this.link.call(Solution.method.setIcon, { projectId: this.projectId, itemId: x.id, icon }); }
  async linkRepository(parent: Item, repository: string, name: string, ref: string): Promise<Added> {
    const r = await this.link.call(Solution.method.link, { projectId: this.projectId, parentId: parent.id, repository, name, ref });
    return { item: this.must(r.itemId), message: r.message };
  }
  setRef(x: Item, ref: string): Promise<Done> { return this.link.call(Solution.method.setRef, { projectId: this.projectId, itemId: x.id, ref }); }
  updateLink(x: Item): Promise<Done> { return this.link.call(Solution.method.updateLink, { projectId: this.projectId, itemId: x.id }); }

  private must(id: string): Item {
    const x = this.live.get(id);
    if (!x) throw new Error(`The storage named an item it did not give: ${id}`);
    return x;
  }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    /* a change was missed: everything is read again */
    if (event.revision !== this.revision + 1) { this.revision = event.revision; this.resync(); return; }
    const changes = fromBinary(SolutionChangesSchema, event.changes);
    this.take(changes.upserted);
    this.drop(changes.removed);
    this.revision = event.revision;
  }

  private take(items: Kept[]): void {
    for (const k of items) {
      const x: Live = this.live.get(k.id) ?? this.gone.get(k.id) ?? { id: k.id, name: '', kind: '', parent: null };
      this.gone.delete(k.id);
      this.live.set(k.id, x);
      x.name = k.name;
      x.kind = k.kind;
      x.icon = k.icon || undefined;
      x.fresh = k.fresh || undefined;
      x.accepts = k.accepts.length ? k.accepts : undefined;
      x.link = k.link ? { repo: k.link.repository, ref: k.link.ref, refs: k.link.refs, resolved: k.link.resolved } : undefined;
      x.file = k.file || undefined;
      x.files = k.files.length ? k.files : undefined;
      x.ignoredFiles = k.ignoredFiles.length ? k.ignoredFiles : undefined;
    }
    /* once every item is there, the ones that name others can point at them */
    const known = (id: string): Item | undefined => this.live.get(id);
    for (const k of items) {
      const x = this.live.get(k.id)!;
      x.parent = known(k.parentId) ?? null;
      x.children = k.container ? k.children.map(known).filter((c): c is Item => !!c) : undefined;
      const flows = k.flows.map(f => [known(f.fromId), known(f.toId)] as const).filter((f): f is readonly [Item, Item] => !!f[0] && !!f[1]);
      x.flows = flows.length ? flows : undefined;
    }
  }
  private drop(ids: string[]): void {
    for (const id of ids) { const x = this.live.get(id); if (x) { this.live.delete(id); this.gone.set(id, x); } }
  }
}
