/* The calls of the Status store: what validation found, and starting things. */
import { create } from '@bufbuild/protobuf';
import { RunSchema, RunScope, RunState, Severity, Status } from '../../../gen/adp/storage/v1/status_pb';
import { newShortGuid } from '../../../ids';
import type { World } from './core';
import { itemOf, kindOf, tellStatus } from './project';

export function serveStatus(world: World): void {
  const { server } = world;

  server.on(Status.method.read, r => world.project(r.projectId).kept.status!);

  server.on(Status.method.validate, r => {
    const state = world.project(r.projectId), found = state.kept.status!.problems, count = (s: Severity) => found.filter(p => p.severity === s).length;
    /* the root is the solution itself, and an entity type is part of its model */
    const items = [...state.items.values()].filter(x => x.parentId && !kindOf(world, x).storedInside).length;
    return { message: `Validated ${items} items: ${count(Severity.ERROR)} errors, ${count(Severity.WARNING)} warnings, ${count(Severity.INFO)} notes` };
  });

  server.on(Status.method.run, (r, call) => {
    const state = world.project(r.projectId), status = state.kept.status!, on = world.seed.environment;
    const start = (itemId: string, label: string, queued: boolean): void => { status.runs.unshift(create(RunSchema, { id: newShortGuid(), itemId, label, environment: on, state: queued ? RunState.QUEUED : RunState.RUNNING })); status.runs.length = Math.min(status.runs.length, 20); };
    let message: string;
    if (r.scope === RunScope.TEST_SUITES) {
      const suites = [...state.items.values()].filter(x => x.kind === 'testsuite');
      for (const x of suites) start(x.id, x.name, true);
      message = `${suites.length} test suites queued on ${on}`;
    } else {
      const x = itemOf(state, r.itemId), queued = kindOf(world, x).tool === 'check';
      start(x.id, x.name, queued);
      message = r.scope === RunScope.TARGET ? `${x.name} started` : `${x.name} ${queued ? 'queued' : 'started'} on ${on}`;
    }
    tellStatus(world, state, call);
    return { message };
  });
}
