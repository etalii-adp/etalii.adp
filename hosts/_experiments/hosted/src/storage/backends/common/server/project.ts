/* What the calls on a project share: finding items, the names things have on disk, what git says of an item, telling what changed, and the steps that can be taken back. */
import { create, toBinary, type MessageInitShape } from '@bufbuild/protobuf';
import { Refused } from '../../../backend';
import type { Kind } from '../../../gen/adp/storage/v1/catalogue_pb';
import { ContentChangesSchema, type Document, type FileTextSchema } from '../../../gen/adp/storage/v1/content_pb';
import { ChangedFileSchema, ChangeGroupSchema, ChangeState, GitSnapshotSchema, ItemGitSchema, type ItemGit } from '../../../gen/adp/storage/v1/git_pb';
import { HistoryEntrySchema, HistorySnapshotSchema, type HistorySnapshot } from '../../../gen/adp/storage/v1/history_pb';
import { KeptProjectSchema } from '../../../gen/adp/storage/v1/kept_pb';
import { LevelSchema, LevelsSnapshotSchema, ViewMode, type Level } from '../../../gen/adp/storage/v1/levels_pb';
import { SolutionChangesSchema, type Item } from '../../../gen/adp/storage/v1/solution_pb';
import { StatusSnapshotSchema } from '../../../gen/adp/storage/v1/status_pb';
import type { Call, ProjectState, World } from './core';

/* how many steps can be taken back */
const STEPS = 60;

export const itemOf = (state: ProjectState, id: string): Item => {
  const x = state.items.get(id);
  if (!x) throw new Refused('gone', 'That item is no longer there.');
  return x;
};
export const kindOf = (world: World, x: Item): Kind => {
  const k = world.kinds.get(x.kind);
  if (!k) throw new Refused('unknown-kind', `There is no kind of item called ${x.kind}.`);
  return k;
};
export const parentOf = (state: ProjectState, x: Item): Item | undefined => x.parentId ? state.items.get(x.parentId) : undefined;
export const childrenOf = (state: ProjectState, x: Item): Item[] => x.children.map(id => state.items.get(id)).filter((k): k is Item => !!k);
/* an item and everything under it */
export const subtree = (state: ProjectState, x: Item): Item[] => [x, ...childrenOf(state, x).flatMap(k => subtree(state, k))];
/* the linked repository an item is, or is in; and the one that makes it read-only: one it is in, not one it is itself */
export const linkOf = (state: ProjectState, x: Item | undefined): Item | undefined => !x ? undefined : x.link ? x : linkOf(state, parentOf(state, x));
export const readOnly = (state: ProjectState, x: Item): Item | undefined => linkOf(state, parentOf(state, x));
export function writable(state: ProjectState, x: Item): void {
  const from = readOnly(state, x);
  if (from) throw new Refused('read-only', `Read-only, from ${from.name} @ ${from.link!.ref}`);
}

export const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/* the name an item has on disk: the one it was given, or one made from its name */
export const disk = (world: World, x: Item): string => { const k = kindOf(world, x); return x.file || (x.container || k.storedFiles.length ? slug(x.name) : slug(x.name) + k.storedSuffix); };
export const pathOf = (world: World, state: ProjectState, x: Item): string => {
  const p = parentOf(state, x);
  if (!p) return state.kept.solution!.path;
  if (kindOf(world, x).storedInside) return pathOf(world, state, p) + '/' + (kindOf(world, p).storedFiles[0] ?? '') + '#' + x.name;
  if (x.link) return '../shared/' + x.link.repository.split('/').pop()!.replace('.git', '');
  return pathOf(world, state, p) + '/' + disk(world, x);
};
/* the files an item is stored in, as they show among the changes */
export const filesOf = (world: World, state: ProjectState, x: Item): string[] => {
  const k = kindOf(world, x), p = parentOf(state, x);
  if (k.storedInside) return p ? [kindOf(world, p).storedFiles[0] ?? '.adp'] : [];
  if (k.storedFiles.length) return [...k.storedFiles];
  return x.container ? ['.adp'] : [disk(world, x)];
};
/* a kind's label as it reads inside a sentence: without its capital, unless it starts with a name */
export const inSentence = (k: Kind): string => /^(AI|C#|Python) /.test(k.label) ? k.label : k.label[0].toLowerCase() + k.label.slice(1);

/* the settings of a level, made when it gets its first one */
export const levelOf = (state: ProjectState, id: string, make = false): Level | undefined => {
  const levels = state.kept.levels!.levels;
  let l = levels.find(o => o.itemId === id);
  if (!l && make) { l = create(LevelSchema, { itemId: id }); levels.push(l); }
  return l;
};
/* how a level shows: its own setting, or that of the level above */
export const viewOf = (state: ProjectState, x: Item | undefined): ViewMode => {
  if (!x) return ViewMode.LOGICAL;
  const own = levelOf(state, x.id)?.view;
  return own ? own : viewOf(state, parentOf(state, x));
};
export const showsAll = (state: ProjectState, x: Item | undefined): boolean => !x ? false : levelOf(state, x.id)?.showAll ?? showsAll(state, parentOf(state, x));

/* what git says of an item, made when it is first needed */
export const gitOf = (state: ProjectState, x: Item): ItemGit => {
  const git = state.kept.git!;
  let g = git.items.find(o => o.itemId === x.id);
  if (!g) {
    /* who last changed it is not kept: it follows from the id, as a stand-in for the log of a real repository */
    const h = parseInt(x.id.slice(-6), 36);
    /* a project that was made here has one commit, of today, by who made it */
    g = state.kept.made ? create(ItemGitSchema, { itemId: x.id, lastAuthor: git.people[0] ?? '' }) : create(ItemGitSchema, { itemId: x.id, lastAuthor: git.people[h % Math.min(4, git.people.length || 1)] ?? '', lastDays: h % 9 + 2 });
    git.items.push(g);
  }
  return g;
};
/* marks an item as changed, with the file that holds the change; an item that was added stays added */
export function mark(world: World, state: ProjectState, x: Item, as: ChangeState = ChangeState.MODIFIED): void {
  const g = gitOf(state, x), git = state.kept.git!;
  if (g.state === ChangeState.UNSPECIFIED || as === ChangeState.ADDED) g.state = as;
  const files = as === ChangeState.ADDED ? filesOf(world, state, x) : filesOf(world, state, x).slice(0, 1);
  let group = git.changes.find(o => o.itemId === x.id);
  if (!group) { group = create(ChangeGroupSchema, { itemId: x.id }); git.changes.push(group); }
  if (as === ChangeState.ADDED) group.files = [];
  for (const path of files) if (!group.files.some(f => f.path === path)) group.files.push(create(ChangedFileSchema, { path, state: g.state }));
}
/* forgets what is not committed of an item and everything under it */
export function unmark(state: ProjectState, items: Item[], forget = false): void {
  const git = state.kept.git!, ids = new Set(items.map(x => x.id));
  git.changes = git.changes.filter(o => !ids.has(o.itemId));
  if (forget) git.items = git.items.filter(o => !ids.has(o.itemId));
  else for (const g of git.items) if (ids.has(g.itemId)) g.state = ChangeState.UNSPECIFIED;
}

/* telling what changed, store by store; each bumps the store's revision */
export function tellSolution(world: World, state: ProjectState, call: Call, upserted: Item[], removed: string[] = []): void {
  const s = state.kept.solution!;
  s.revision++;
  world.server.changed.add(state.id);
  world.server.emit('Solution', state.id, s.revision, call, SolutionChangesSchema, { upserted, removed });
}
export function tellGit(world: World, state: ProjectState, call: Call): void {
  const g = state.kept.git!;
  for (const x of state.items.values()) gitOf(state, x);
  g.revision++;
  world.server.changed.add(state.id);
  world.server.emit('Git', state.id, g.revision, call, GitSnapshotSchema, g);
}
export function tellLevels(world: World, state: ProjectState, call: Call): void {
  const l = state.kept.levels!;
  l.revision++;
  world.server.changed.add(state.id);
  world.server.emit('Levels', state.id, l.revision, call, LevelsSnapshotSchema, l);
}
export function tellStatus(world: World, state: ProjectState, call: Call): void {
  const s = state.kept.status!;
  s.revision++;
  world.server.changed.add(state.id);
  world.server.emit('Status', state.id, s.revision, call, StatusSnapshotSchema, s);
}
/* documents that were written, and the items whose document may read differently now; without either, every document may */
export function tellContent(world: World, state: ProjectState, call: Call, written: Document[] = [], stale: string[] = []): void {
  state.kept.contentRevision++;
  world.server.changed.add(state.id);
  world.server.emit('Content', state.id, state.kept.contentRevision, call, ContentChangesSchema, { written, stale, allStale: !written.length && !stale.length });
}

export const historyOf = (state: ProjectState): HistorySnapshot => create(HistorySnapshotSchema, {
  revision: state.historyRevision,
  entries: [...state.steps.map(s => s.entry), ...[...state.undone].reverse().map(s => s.entry)],
  undoLabel: state.steps.at(-1)?.entry.label ?? '', redoLabel: state.undone.at(-1)?.entry.label ?? '',
});
export function tellHistory(world: World, state: ProjectState, call: Call): void {
  state.historyRevision++;
  world.server.emit('History', state.id, state.historyRevision, call, HistorySnapshotSchema, historyOf(state));
}

/* The text of an item's stored form before anything was written of it, and of a file beside the items: what the seed gives for the projects it brought, and nothing for a project that was made here. */
export const startText = (world: World, state: ProjectState, x: Item): string => state.kept.made ? '' : world.seed.document(state, x, world);
export const startFile = (world: World, state: ProjectState, owner: Item, path: string): MessageInitShape<typeof FileTextSchema> =>
  state.kept.made ? { text: `# ${path}\nitem: ${owner.id}\nname: "${owner.name}"\nkind: ${owner.kind}`, holds: '' } : world.seed.file(state, owner, path, world);

/* the project as it is now, without the window's own state and the conversations with the agent: what a step puts back */
export const picture = (state: ProjectState): Uint8Array => toBinary(KeptProjectSchema, create(KeptProjectSchema, { ...state.kept, workbench: undefined, agent: undefined }));

/* carries out a command that can be taken back: the project as it was is kept with a few words on what the command did */
export function step<T>(world: World, state: ProjectState, call: Call, label: string, run: () => T): T {
  const before = picture(state), result = run();
  state.steps.push({ entry: create(HistoryEntrySchema, { id: call.id, label, user: call.user }), before });
  if (state.steps.length > STEPS) state.steps.shift();
  state.undone = [];
  tellHistory(world, state, call);
  return result;
}
/* after something that cannot be taken back, such as a commit, the steps before it cannot be either */
export function sealHistory(world: World, state: ProjectState, call: Call): void {
  if (!state.steps.length && !state.undone.length) return;
  state.steps = []; state.undone = [];
  tellHistory(world, state, call);
}
