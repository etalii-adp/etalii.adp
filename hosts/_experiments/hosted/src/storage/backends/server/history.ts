/* The calls of the History store: the commands that changed a project, taking the last one back, and doing it again. */
import { Refused } from '../../backend';
import { create } from '@bufbuild/protobuf';
import { ContentChangesSchema, DocumentSchema } from '../../gen/adp/storage/v1/content_pb';
import { History } from '../../gen/adp/storage/v1/history_pb';
import type { Call, ProjectState, World } from './core';
import { historyOf, picture, startText, tellGit, tellHistory, tellLevels, tellSolution, tellStatus } from './project';

/* puts a project back as a step holds it, and tells every store */
export function putBack(world: World, state: ProjectState, bytes: Uint8Array, call: Call): ProjectState {
  const before = new Set(state.items.keys()), written = [...state.documents.keys()], next = world.restore(state, bytes);
  tellSolution(world, next, call, [...next.items.values()], [...before].filter(id => !next.items.has(id)));
  tellLevels(world, next, call);
  next.kept.contentRevision++;
  /* a document that was written and is not any more reads as before it was written; it is told with the others, so nobody shows the text that was taken back while asking for the old one */
  const unwritten = written.filter(id => !next.documents.has(id) && next.items.has(id)).map(id => create(DocumentSchema, { itemId: id, text: startText(world, next, next.items.get(id)!) }));
  world.server.emit('Content', next.id, next.kept.contentRevision, call, ContentChangesSchema, { written: [...next.kept.documents, ...unwritten], allStale: true });
  tellGit(world, next, call);
  tellStatus(world, next, call);
  return next;
}

export function serveHistory(world: World): void {
  const { server } = world;

  server.on(History.method.read, r => historyOf(world.project(r.projectId)));

  server.on(History.method.undo, (r, call) => {
    const state = world.project(r.projectId), last = state.steps.at(-1);
    if (!last) throw new Refused('nothing', 'There is nothing to undo.');
    if (r.entryId && last.entry.id !== r.entryId) throw new Refused('later-changes', 'That cannot be undone by itself any more: something else was changed after it. Undo takes back the last change first.');
    state.steps.pop();
    last.after = picture(state);
    last.entry.undone = true;
    const next = putBack(world, state, last.before, call);
    next.undone.push(last);
    tellHistory(world, next, call);
    return { message: `Undid: ${last.entry.label}` };
  });

  server.on(History.method.redo, (r, call) => {
    const state = world.project(r.projectId), last = state.undone.at(-1);
    if (!last?.after) throw new Refused('nothing', 'There is nothing to redo.');
    state.undone.pop();
    last.entry.undone = false;
    const next = putBack(world, state, last.after, call);
    next.steps.push(last);
    tellHistory(world, next, call);
    return { message: `Redid: ${last.entry.label}` };
  });
}
