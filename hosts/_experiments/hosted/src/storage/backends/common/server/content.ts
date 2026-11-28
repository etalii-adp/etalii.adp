/* The calls of the Content store: the text of an item's stored form, the text of the files beside the items, and writing a document. */
import { create } from '@bufbuild/protobuf';
import { Refused } from '../../../backend';
import { Content, DocumentSchema } from '../../../gen/adp/storage/v1/content_pb';
import type { World } from './core';
import { itemOf, mark, startFile, startText, step, tellContent, tellGit, writable } from './project';
import { keepDocument } from './solution';

export function serveContent(world: World): void {
  const { server } = world;

  server.on(Content.method.read, r => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    return state.documents.get(x.id) ?? create(DocumentSchema, { itemId: x.id, text: startText(world, state, x) });
  });

  server.on(Content.method.readFile, r => {
    const state = world.project(r.projectId);
    return startFile(world, state, itemOf(state, r.ownerId), r.path);
  });

  server.on(Content.method.write, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId), at = state.documents.get(x.id)?.revision ?? 0;
    writable(state, x);
    if (r.baseRevision !== at) throw new Refused('conflict', `${x.name} was changed in the meantime. It shows as it is now.`);
    return step(world, state, call, `Edit ${x.name}`, () => {
      const doc = keepDocument(state, x.id, r.text);
      mark(world, state, r.touchedId ? itemOf(state, r.touchedId) : x);
      tellContent(world, state, call, [doc]);
      tellGit(world, state, call);
      return {};
    });
  });
}
