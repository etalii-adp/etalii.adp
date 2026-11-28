/* The example data as a seed: the Atlas Platform of an energy utility, with its user, its projects, its git log and the text of everything in it. Every example name, number and text is in the YAML files of this folder and nowhere else: the build reads them into gen/data.ts, and this module turns them into the messages of the contract. An item is named in the files by the name it has in solution.yaml, and gets its id here. */
import type { MessageInitShape } from '@bufbuild/protobuf';
import type { CheckDocument, DashboardDocument, FormDocument, FormField, OntologyDocument, PageDocument, PageSection, SchemaDocument, SectionType, TextDocument } from '../../documents';
import { Author } from '../../gen/adp/storage/v1/agent_pb';
import { ChangeState, RefKind } from '../../gen/adp/storage/v1/git_pb';
import type { KeptProjectSchema } from '../../gen/adp/storage/v1/kept_pb';
import { ViewMode, type LevelSchema } from '../../gen/adp/storage/v1/levels_pb';
import type { ItemSchema } from '../../gen/adp/storage/v1/solution_pb';
import type { Item } from '../../gen/adp/storage/v1/solution_pb';
import { Severity as ProblemSeverity } from '../../gen/adp/storage/v1/status_pb';
import { gitHashOf, shortGuidOf } from '../../ids';
import type { ProjectState, World } from '../common/server/core';
import { childrenOf, disk, kindOf, parentOf, showsAll, slug, viewOf } from '../common/server/project';
import type { Seed } from '../common/server/seed';
import { data } from './gen/data';
import type { Change, Choice, ItemData, Severity } from './shape';

const { workspace, solution, git, status, workbench, agent, flows, ontology, schemas, pages, dashboards, forms, checks, documents, code, files } = data;

type ItemInit = MessageInitShape<typeof ItemSchema>;
type LevelInit = MessageInitShape<typeof LevelSchema>;

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: unknown): string => String(s).replace(/[&<>"]/g, ch => entities[ch]);
const stateOf: Record<Change, ChangeState> = { modified: ChangeState.MODIFIED, added: ChangeState.ADDED };
const severityOf: Record<Severity, ProblemSeverity> = { error: ProblemSeverity.ERROR, warning: ProblemSeverity.WARNING, info: ProblemSeverity.INFO };
const refKindOf = { local: RefKind.LOCAL, remote: RefKind.REMOTE, tag: RefKind.TAG };

/* what a file has under a name, if it has that name itself */
const at = <T>(under: Partial<Record<string, T>>, name: string): T | undefined => Object.hasOwn(under, name) ? under[name] : undefined;
/* a text with every part between {{ and }} filled in; a part nothing is known of stays as it is. Where the text is HTML, what is filled in is escaped. */
const fill = (text: string, parts: Record<string, string>, html = false): string => text.replace(/\{\{(\w+)\}\}/g, (all, part: string) => Object.hasOwn(parts, part) ? html ? esc(parts[part]) : parts[part] : all);
/* what a choice comes to for an item, by the name the item started with */
function pick<T extends string | boolean | string[]>(choice: Choice<T>, was: string): T {
  return typeof choice === 'object' && !Array.isArray(choice) ? at(choice.items, was) ?? choice.otherwise : choice;
}

const projectId = (name: string): string => shortGuidOf('project/' + name);
/* the one project that opens */
const OPENS = projectId(workspace.opens);

/* The hierarchy as it starts: every item with an id made from its place, so it has the same id on every load. Each ontology model carries its entity types as child items, so the hierarchy and the diagram show the same things. */
interface Start { items: ItemInit[]; levels: LevelInit[]; names: Map<string, string>; byName: Map<string, string> }
function start(): Start {
  const items: ItemInit[] = [], levels: LevelInit[] = [], models: ItemInit[] = [];
  const adopt = (from: ItemData, parentId: string, place: string): string => {
    const id = shortGuidOf(place), x: ItemInit = { id, name: from.name, kind: from.kind, parentId, container: !!from.children, icon: from.icon ?? '', accepts: from.accepts ?? [], file: from.file ?? '', files: from.files ?? [], ignoredFiles: from.ignoredFiles ?? [] };
    if (from.link) x.link = { repository: from.link.repository, ref: from.link.ref, refs: from.link.refs, resolved: gitHashOf(from.link.ref + from.name) };
    items.push(x);
    const kids = from.children ?? [], children = kids.map(k => adopt(k, id, place + '/' + k.name));
    /* a flow and a place on the canvas name a child of this level */
    const child = (name: string): string => { const i = kids.findIndex(k => k.name === name); if (i < 0) throw new Error(`solution.yaml: ${from.name} has no child ${name}`); return children[i]; };
    x.children = children;
    x.flows = (from.flows ?? []).map(f => ({ fromId: child(f.from), toId: child(f.to) }));
    if (from.view || from.layout) levels.push({ itemId: id, view: from.view === 'files' ? ViewMode.FILES : from.view === 'logical' ? ViewMode.LOGICAL : ViewMode.UNSPECIFIED, layout: (from.layout ?? []).map(l => ({ itemId: child(l.item), x: l.x, y: l.y })) });
    if (from.kind === 'ontology') models.push(x);
    return id;
  };
  adopt(solution.root, '', solution.key);
  for (const model of models) {
    const made = (at(ontology.models, model.name!)?.entities ?? []).map((e): ItemInit => ({ id: entityId(model.id!, e.name), name: e.name, kind: 'entity', parentId: model.id, icon: e.definedIn ? 'link' : '' }));
    model.container = true;
    model.accepts = ['entity'];
    model.children = made.map(e => e.id!);
    items.push(...made);
  }
  const names = new Map(items.map(x => [x.id!, x.name!])), byName = new Map<string, string>();
  for (const x of items) if (!byName.has(x.name!)) byName.set(x.name!, x.id!);
  return { items, levels, names, byName };
}
const entityId = (modelId: string, name: string): string => shortGuidOf('entity/' + modelId + '/' + name);

const STARTED = start();
/* what the project overview says of the one project that opens: counted, so it agrees with what validation counts */
const count = (is: (x: ItemInit) => boolean): string => String(STARTED.items.filter(is).length);
const COUNTED = { areas: count(x => x.kind === 'area'), items: count(x => !!x.parentId && x.kind !== 'entity'), links: count(x => !!x.link) };
/* the name an item had when the example was made: what it holds is looked up by that name, so renaming an item does not change what it holds */
const first = (x: Item): string => STARTED.names.get(x.id) ?? '';
/* the id of the item that had a name in the example, if it is still there */
const idOf = (state: ProjectState, name: string): string => { const id = STARTED.byName.get(name); return id && state.items.has(id) ? id : ''; };

function opened(): MessageInitShape<typeof KeptProjectSchema> {
  const { items, levels, byName } = STARTED, id = (name: string): string => byName.get(name) ?? '', link = workspace.suggestedLink;
  return {
    solution: { revision: 1, rootId: items[0].id, items, path: solution.path, suggestedLink: { repository: link.repository, ref: link.refs[0], refs: link.refs }, suggestedLinkName: link.name, suggestedLinkParentId: id(link.under) },
    levels: { revision: 1, levels },
    git: {
      revision: 1, branch: git.branch, upstream: git.upstream, ahead: git.ahead, behind: git.behind, fetched: git.fetched, people: git.people, suggestedMessage: git.suggestedMessage,
      refs: git.refs.map(r => ({ name: r.name, label: r.name.replace(/^origin\//, ''), kind: refKindOf[r.kind], hash: r.at })),
      commits: git.commits.map(c => ({ hash: c.hash, lane: c.lane, parents: c.parents, message: c.message, author: c.author, when: c.when, days: c.days, touched: c.touched.map(t => ({ itemId: id(t.item), state: stateOf[t.state] })) })),
      changes: git.changes.map(c => ({ itemId: id(c.item), files: c.files.map(f => ({ path: f.path, state: stateOf[f.state] })) })),
      items: git.items.map(x => ({ itemId: id(x.item), state: stateOf[x.state], lastAuthor: x.lastAuthor, lastDays: x.lastDays })),
    },
    status: {
      revision: 1, problems: status.problems.map(p => ({ severity: severityOf[p.severity], message: p.message, itemId: id(p.item) })),
      environments: status.environments, defaultRunId: id(status.defaultRun),
    },
    workbench: { selectedId: id(workbench.selected), documentId: id(workbench.document), tabIds: workbench.tabs.map(id), expandedIds: workbench.expanded.map(id) },
    contentRevision: 1,
    agent: {
      revision: 1,
      conversations: agent.conversations.map((c, n) => {
        const messages = c.messages.map((m, i) => ({ id: shortGuidOf(`agent/${n}/${i}`), author: m.author === 'user' ? Author.USER : Author.AGENT, text: m.text, time: m.time, itemIds: (m.items ?? []).map(id).filter(Boolean), steps: m.steps ?? [] }));
        return { about: { id: shortGuidOf(`agent/${n}`), title: c.title, day: c.day, time: c.time, messages: messages.length, last: cutLine(c.messages.at(-1)!.text) }, messages };
      }),
    },
  };
}
/* the start of a text, as a list of conversations shows what was said last */
const cutLine = (text: string): string => { const line = text.replace(/\s+/g, ' '); return line.length > 90 ? line.slice(0, line.lastIndexOf(' ', 90)) + '…' : line; };

/* the text of a level's .adp file, or of its .user.adp file */
function adpText(state: ProjectState, o: Item, world: World, user: boolean): string {
  const children = childrenOf(state, o);
  return user ? `# Your personal overrides for ${o.name}. Ignored by git, so they stay on this computer.\nview: ${viewOf(state, o) === ViewMode.FILES ? 'files' : 'logical'}\nshowAllFiles: ${showsAll(state, o)}\ncanvas:\n  layout:\n${children.slice(0, 3).map((k, i) => `    ${k.id}: { x: ${i * 300 + 40}, y: ${i % 2 * 120 + 20} }   # ${k.name}`).join('\n') || '    {}'}`
    : `# Shared settings for ${o.name}. Committed with the project.\nid: ${o.id}\nname: "${o.name}"\nkind: ${o.kind}\nicon: ${o.icon || kindOf(world, o).icon}\nview: logical            # logical or files\nshowAllFiles: false\n${o.link ? `link:\n  repository: "${o.link.repository}"\n  ref: "${o.link.ref}"\n` : ''}children:\n${children.map(k => `  - id: ${k.id}            # ${k.name}`).join('\n') || '  []'}\ncanvas:\n  layout:\n${children.map((k, i) => `    ${k.id}: { x: ${i % 3 * 300}, y: ${Math.floor(i / 3) * 210} }`).join('\n') || '    {}'}`;
}

/* the text an editor shows for an item: a source file of an application by its name on disk, the others by their name or their kind */
function codeText(x: Item, world: World): string {
  if (x.fresh) return '';
  if (x.kind === 'csharp' || x.kind === 'python') return at(files.texts, disk(world, x)) ?? '';
  return at(code.items, first(x)) ?? fill(at(code.kinds, x.kind) ?? code.otherwise, { name: x.name, slug: slug(x.name) });
}

/* one section of a portal page, as it will look on that page */
function section(type: SectionType, x: Item): string {
  const was = first(x), s = pages.sections[type];
  return fill(fill(s.html, Object.fromEntries(Object.entries(s.parts ?? {}).map(([part, choice]) => [part, pick(choice, was)]))), { name: x.name }, true);
}
function pageDocument(state: ProjectState, x: Item): PageDocument {
  const was = first(x), types = x.fresh ? pages.otherwise : at(pages.items, was) ?? pages.otherwise, library = state.items.get(idOf(state, pages.library.item));
  const sections = types.map((type): PageSection => {
    const s = pages.sections[type], unbound = !!at(pages.unbound.sections, was)?.includes(type);
    return { type, name: s.name, html: section(type, x), unbound, binding: unbound ? pages.unbound.binding : s.binding, refresh: s.refresh };
  });
  return { sections, components: [...(library ? childrenOf(state, library).filter(k => k.kind === pages.library.kind).map(k => k.name) : []), ...pages.library.more], from: fill(pages.library.from, { ref: library?.link?.ref ?? '' }) };
}

function ontologyDocument(state: ProjectState, x: Item): OntologyDocument {
  const model = x.fresh ? undefined : at(ontology.models, first(x)), doc: OntologyDocument = { entities: {}, relations: [] };
  if (!model) return doc;
  const id = (name: string): string => entityId(x.id, name);
  for (const e of model.entities) if (state.items.has(id(e.name))) doc.entities[id(e.name)] = { attrs: [...e.attrs], x: e.x, y: e.y, ...(e.definedIn ? { ext: e.definedIn } : {}) };
  doc.relations = model.relations.filter(r => state.items.has(id(r.from)) && state.items.has(id(r.to))).map(r => [id(r.from), id(r.to), r.label]);
  return doc;
}

function formDocument(state: ProjectState, x: Item): FormDocument {
  const was = first(x), parts = { name: x.name, slug: slug(x.name) };
  return {
    sections: (at(forms.kinds, x.kind) ?? forms.otherwise).map(s => [s.title, s.fields.map(([label, type, value]): FormField => {
      const v = pick(value, was);
      /* a reference names an item, and gets that item's id when the form is read */
      if (type === 'ref') return [label, 'ref', v as string, idOf(state, v as string)];
      return [label, type, typeof v === 'string' ? fill(v, parts) : v] as FormField;
    })]),
  };
}

function textDocument(state: ProjectState, x: Item): TextDocument {
  const folder = parentOf(state, x)?.name ?? '', parts = { name: x.name, folder };
  if (x.fresh) return { html: fill(documents.fresh, parts, true) };
  return { html: at(documents.items, first(x)) ?? fill(at(documents.folders, folder) ?? documents.otherwise, parts, true) };
}

export const example: Seed = {
  version: workspace.version,
  workspace: workspace.workspace,
  user: { id: shortGuidOf('user/' + workspace.user.email.split('@')[0]), name: workspace.user.name, email: workspace.user.email, initials: workspace.user.initials },
  password: workspace.password,
  answerMs: workspace.answerMs,
  providers: workspace.providers,
  projects: workspace.projects.map(p => {
    const opens = projectId(p.name) === OPENS;
    return { id: projectId(p.name), name: p.name, initials: p.initials, colour: p.colour, path: p.path, branch: p.branch, about: opens ? fill(p.about, COUNTED) : p.about, opened: p.opened, asset: p.asset, errors: opens ? status.problems.filter(f => f.severity === 'error').length : 0 };
  }),
  lastOpenedId: OPENS,
  project: about => about.id === OPENS ? opened() : fill(workspace.closed, { name: workspace.opens }),

  document(state, x, world) {
    const tool = kindOf(world, x).tool, was = first(x);
    if (tool === 'flow') return JSON.stringify(x.fresh ? { nodes: [], edges: [] } : at(flows.items, was) ?? at(flows.kinds, x.kind) ?? { nodes: [], edges: [] });
    if (tool === 'onto') return JSON.stringify(ontologyDocument(state, x));
    if (tool === 'schema') return JSON.stringify({ fields: x.fresh ? [] : at(schemas.items, was) ?? schemas.otherwise, settings: { format: pick(schemas.settings.format, was), version: schemas.settings.version, compat: schemas.settings.compat }, usedBy: (at(schemas.usedBy, was) ?? []).map(name => idOf(state, name)).filter(Boolean) } satisfies SchemaDocument);
    if (tool === 'page') return JSON.stringify(pageDocument(state, x));
    if (tool === 'dash') return JSON.stringify({ note: dashboards.note, ...(at(dashboards.items, was) ?? dashboards.items[dashboards.otherwise]) } satisfies DashboardDocument);
    if (tool === 'form') return JSON.stringify(formDocument(state, x));
    if (tool === 'check') return JSON.stringify({ rows: x.fresh ? [] : at(checks.items, was) ?? at(checks.kinds, x.kind) ?? [], lastRun: checks.lastRun } satisfies CheckDocument);
    if (tool === 'doc') return JSON.stringify(textDocument(state, x));
    if (tool === 'code') return codeText(x, world);
    return '';
  },

  file(state, owner, path, world) {
    const name = path.split('/').pop() ?? path, holds = at(files.holds, name) ?? '', text = at(files.texts, name), parts = { file: name, name: owner.name, id: owner.id, kind: owner.kind };
    if (text !== undefined) return { text, holds, syntax: /\.(cs|py|sql)$/.test(name) ? '' : 'settings' };
    if (name === '.adp') return { text: adpText(state, owner, world, false), holds };
    if (name === '.user.adp') return { text: adpText(state, owner, world, true), holds };
    return { text: fill(name.endsWith('.sql') ? files.sql : files.otherwise, parts), holds };
  },

  suggestedLink: { repository: workspace.suggestedLink.repository, name: workspace.suggestedLink.name, refs: workspace.suggestedLink.refs },
  repository: () => ({ icon: workspace.linkedRepository.icon, refs: [...workspace.linkedRepository.refs], items: workspace.linkedRepository.items.map(i => ({ ...i })) }),
  sinceFetch: workspace.sinceFetch,
  environment: workspace.environment,
};
