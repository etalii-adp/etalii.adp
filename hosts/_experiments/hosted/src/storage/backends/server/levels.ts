/* The calls of the Levels store: how each level shows, and the layout of its canvas. */
import { create } from '@bufbuild/protobuf';
import { Levels, PlaceSchema, ViewMode } from '../../gen/adp/storage/v1/levels_pb';
import type { World } from './core';
import { itemOf, levelOf, parentOf, tellContent, tellLevels, viewOf } from './project';

export function serveLevels(world: World): void {
  const { server } = world;

  server.on(Levels.method.read, r => world.project(r.projectId).kept.levels!);

  /* sets how a level and everything under it is shown; a level that shows as its parent does keeps no setting of its own */
  server.on(Levels.method.setView, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId), p = parentOf(state, x), level = levelOf(state, x.id, true)!;
    level.view = (p && viewOf(state, p) === r.view) || (!p && r.view === ViewMode.LOGICAL) ? ViewMode.UNSPECIFIED : r.view;
    tellLevels(world, state, call);
    tellContent(world, state, call);
    return { message: `${x.name} now shows as ${r.view === ViewMode.FILES ? 'File System' : 'Logical Structure'}. Saved in its .user.adp` };
  });

  server.on(Levels.method.setShowAll, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    levelOf(state, x.id, true)!.showAll = r.showAll;
    tellLevels(world, state, call);
    tellContent(world, state, call);
    return {};
  });

  server.on(Levels.method.setLayout, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    levelOf(state, x.id, true)!.ownLayout = r.places.map(p => create(PlaceSchema, p));
    tellLevels(world, state, call);
    tellContent(world, state, call);
    return {};
  });

  server.on(Levels.method.resetLayout, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId), level = levelOf(state, x.id);
    if (level?.ownLayout.length) { level.ownLayout = []; tellLevels(world, state, call); tellContent(world, state, call); }
    return {};
  });
}
