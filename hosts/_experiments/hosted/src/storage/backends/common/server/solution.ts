/* The calls of the Solution store: reading the hierarchy, and adding, renaming, deleting, giving an icon, and linking a repository in. */
import { create } from '@bufbuild/protobuf';
import { Refused } from '../../../backend';
import { DocumentSchema } from '../../../gen/adp/storage/v1/content_pb';
import { ChangeState } from '../../../gen/adp/storage/v1/git_pb';
import { ItemSchema, Solution, type Item } from '../../../gen/adp/storage/v1/solution_pb';
import type { EntityContent, OntologyDocument } from '../../../documents';
import { gitHashOf, newShortGuid } from '../../../ids';
import type { ProjectState, World } from './core';
import { childrenOf, inSentence, itemOf, kindOf, mark, parentOf, pathOf, startText, step, subtree, tellContent, tellGit, tellSolution, tellStatus, unmark, writable } from './project';

/* why a name cannot be given to an item; nothing is thrown when it can */
function nameable(state: ProjectState, x: Item, name: string): void {
  const p = parentOf(state, x);
  if (!name) throw new Refused('invalid', 'A name is required.');
  if (/[\\/:*?"<>|]/.test(name)) throw new Refused('invalid', 'A name cannot contain \\ / : * ? " < > |');
  if (p && childrenOf(state, p).some(s => s !== x && s.name.toLowerCase() === name.toLowerCase())) throw new Refused('taken', `"${name}" already exists in ${p.name}.`);
}

/* the document of a model, as it is kept or as it starts */
export const ontologyOf = (world: World, state: ProjectState, model: Item): OntologyDocument =>
  JSON.parse(state.documents.get(model.id)?.text ?? startText(world, state, model)) as OntologyDocument;
/* keeps a document, as a write does, and gives it back to be told about */
export function keepDocument(state: ProjectState, itemId: string, text: string) {
  const was = state.documents.get(itemId), doc = create(DocumentSchema, { itemId, revision: (was?.revision ?? 0) + 1, text });
  state.documents.set(itemId, doc);
  state.kept.documents = [...state.documents.values()];
  return doc;
}

function put(state: ProjectState, x: Item, parent: Item): void {
  state.items.set(x.id, x);
  state.kept.solution!.items.push(x);
  parent.children.push(x.id);
}

export function serveSolution(world: World): void {
  const { server } = world;

  server.on(Solution.method.read, r => world.project(r.projectId).kept.solution!);

  server.on(Solution.method.add, (r, call) => {
    const state = world.project(r.projectId), p = itemOf(state, r.parentId), k = world.kinds.get(r.kind);
    if (!k) throw new Refused('unknown-kind', `There is no kind of item called ${r.kind}.`);
    if (!p.container) throw new Refused('invalid', `${p.name} does not hold items.`);
    writable(state, p);
    const siblings = childrenOf(state, p), base = 'New ' + inSentence(k);
    let name = base, i = 2;
    while (siblings.some(s => s.name === name)) name = base + ' ' + i++;
    const x = create(ItemSchema, { id: newShortGuid(), name, kind: k.name, parentId: p.id, fresh: true });
    if (k.name === 'group') { x.container = true; x.accepts = [...p.accepts]; }
    if (k.takes.length) { x.container = true; x.accepts = [...k.takes]; }
    return step(world, state, call, `Add ${name}`, () => {
      put(state, x, p);
      mark(world, state, x, ChangeState.ADDED);
      tellSolution(world, state, call, [x, p]);
      /* a model starts with an empty document, and an entity type gets a place in its model's document, under the others */
      if (kindOf(world, x).tool === 'onto') tellContent(world, state, call, [keepDocument(state, x.id, JSON.stringify({ entities: {}, relations: [] } satisfies OntologyDocument))]);
      if (k.storedInside && kindOf(world, p).tool === 'onto') {
        const doc = ontologyOf(world, state, p), placed = siblings.filter(s => doc.entities[s.id]?.x !== undefined), height = (e: EntityContent) => 38 + e.attrs.length * 19;
        doc.entities[x.id] = { attrs: [], x: (placed.filter(s => s.fresh).length % 4) * 250, y: Math.max(0, ...placed.filter(s => !s.fresh).map(s => (doc.entities[s.id].y ?? 0) + height(doc.entities[s.id]))) + 40 };
        tellContent(world, state, call, [keepDocument(state, p.id, JSON.stringify(doc))]);
      }
      tellGit(world, state, call);
      return { itemId: x.id };
    });
  });

  server.on(Solution.method.rename, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId), name = r.name.trim();
    writable(state, x);
    nameable(state, x, name);
    if (name === x.name) return {};
    return step(world, state, call, `Rename ${x.name} to ${name}`, () => {
      const added = state.kept.git!.items.find(g => g.itemId === x.id)?.state === ChangeState.ADDED;
      x.name = name;
      if (x.link) x.link.resolved = gitHashOf(x.link.ref + x.name);
      mark(world, state, x, added ? ChangeState.ADDED : ChangeState.MODIFIED);
      tellSolution(world, state, call, [x]);
      tellGit(world, state, call);
      tellContent(world, state, call);
      return {};
    });
  });

  server.on(Solution.method.delete, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId), p = parentOf(state, x);
    if (!p) throw new Refused('invalid', 'The project root stays');
    writable(state, x);
    const message = `Deleted ${x.name}${x.container ? ' and its ' + x.children.length + ' items' : ''}`;
    return step(world, state, call, `Delete ${x.name}`, () => {
      const gone = subtree(state, x), ids = new Set(gone.map(g => g.id));
      p.children = p.children.filter(id => id !== x.id);
      p.flows = p.flows.filter(f => f.fromId !== x.id && f.toId !== x.id);
      for (const id of ids) state.items.delete(id);
      state.kept.solution!.items = state.kept.solution!.items.filter(o => !ids.has(o.id));
      unmark(state, gone, true);
      const status = state.kept.status!, problems = status.problems.filter(q => !ids.has(q.itemId));
      tellSolution(world, state, call, [p], [...ids]);
      /* an entity type leaves its model's document as well, with the relations it was in */
      if (kindOf(world, x).storedInside && kindOf(world, p).tool === 'onto') {
        const doc = ontologyOf(world, state, p);
        delete doc.entities[x.id];
        doc.relations = doc.relations.filter(([a, b]) => a !== x.id && b !== x.id);
        tellContent(world, state, call, [keepDocument(state, p.id, JSON.stringify(doc))]);
      } else tellContent(world, state, call);
      tellGit(world, state, call);
      if (problems.length !== status.problems.length) { status.problems = problems; tellStatus(world, state, call); }
      return { message };
    });
  });

  server.on(Solution.method.setIcon, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    writable(state, x);
    return step(world, state, call, `Change the icon of ${x.name}`, () => {
      x.icon = r.icon;
      tellSolution(world, state, call, [x]);
      tellContent(world, state, call);
      return { message: 'Icon saved in ' + pathOf(world, state, x.container ? x : parentOf(state, x)!) + '/.adp' };
    });
  });

  server.on(Solution.method.link, (r, call) => {
    const state = world.project(r.projectId), p = itemOf(state, r.parentId);
    if (!p.container || p.link) throw new Refused('invalid', `A repository cannot be linked into ${p.name}.`);
    writable(state, p);
    const repo = world.seed.repository(r.repository), name = r.name.trim() || 'Linked repository';
    nameable(state, create(ItemSchema, { parentId: p.id }), name);
    return step(world, state, call, `Link ${name}`, () => {
      const x = create(ItemSchema, { id: newShortGuid(), name, kind: 'group', parentId: p.id, container: true, icon: repo.icon, link: { repository: r.repository, ref: r.ref || repo.refs[0], refs: repo.refs, resolved: gitHashOf((r.ref || repo.refs[0]) + name) } });
      put(state, x, p);
      const inside = repo.items.map(o => create(ItemSchema, { id: newShortGuid(), name: o.name, kind: o.kind, parentId: x.id }));
      for (const k of inside) put(state, k, x);
      mark(world, state, x, ChangeState.ADDED);
      tellSolution(world, state, call, [x, ...inside, p]);
      tellGit(world, state, call);
      tellContent(world, state, call);
      return { itemId: x.id, message: `${x.name} is linked. Its items continue the hierarchy here.` };
    });
  });

  server.on(Solution.method.setRef, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    if (!x.link) throw new Refused('invalid', `${x.name} is not a linked repository.`);
    if (!x.link.refs.includes(r.ref)) throw new Refused('invalid', `${x.name} has no branch or tag called ${r.ref}.`);
    return step(world, state, call, `Let ${x.name} follow ${r.ref}`, () => {
      x.link!.ref = r.ref;
      x.link!.resolved = gitHashOf(r.ref + x.name);
      tellSolution(world, state, call, [x]);
      tellContent(world, state, call);
      return { message: `${x.name} now follows ${r.ref}` };
    });
  });

  server.on(Solution.method.updateLink, r => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    if (!x.link) throw new Refused('invalid', `${x.name} is not a linked repository.`);
    return { message: `${x.name} is up to date with ${x.link.ref}` };
  });
}
