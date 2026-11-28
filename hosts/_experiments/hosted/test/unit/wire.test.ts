/* The wire: calls as envelopes over a connection, and what happens when the connection loses a message, drops, or cannot be made at all. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { Refused, Storage, Unreachable, type BackendState } from '../../src/storage';
import { example } from '../../src/storage/backends/_example';
import { makeWorld } from '../../src/storage/backends/common/server';
import type { World } from '../../src/storage/backends/common/server/core';
import { PROTOCOL, Wire, type WireOptions } from '../../src/storage/backends/common/wire/client';
import { serve } from '../../src/storage/backends/common/wire/service';
import type { Socket } from '../../src/storage/backends/common/wire/socket';
import { loopback } from '../../src/storage/backends/loopback';
import { noFaults, pair, type Faults } from '../../src/storage/backends/loopback/pair';
import { EnvelopeSchema, type Event } from '../../src/storage/gen/adp/storage/v1/envelope_pb';
import { Git } from '../../src/storage/gen/adp/storage/v1/git_pb';
import { Projects } from '../../src/storage/gen/adp/storage/v1/projects_pb';
import { Solution } from '../../src/storage/gen/adp/storage/v1/solution_pb';

/* short times, so a test waits milliseconds where a page would wait seconds */
const quick: Partial<WireOptions> = { limitMs: 150, retryMs: [5, 5, 5], pingMs: 0 };
const wait = (ms: number): Promise<void> => new Promise(done => setTimeout(done, ms));
const until = async (what: () => boolean, ms = 500): Promise<void> => { for (const end = Date.now() + ms; !what();) { if (Date.now() > end) throw new Error('It did not happen in time.'); await wait(2); } };

async function opened(world: World, faults: Faults = noFaults(), options = quick): Promise<{ wire: Wire; projectId: string; pipelines: string; events: Event[]; states: BackendState[] }> {
  const wire = loopback(world, options, faults), events: Event[] = [], states: BackendState[] = [];
  wire.watch(e => events.push(e));
  wire.onState(s => states.push(s));
  const projects = await wire.call(Projects.method.read, {});
  await wire.call(Projects.method.open, { projectId: projects.lastOpenedId });
  const solution = await wire.call(Solution.method.read, { projectId: projects.lastOpenedId });
  return { wire, projectId: projects.lastOpenedId, pipelines: solution.items.find(x => x.name === 'Pipelines')!.id, events, states };
}
const itemCount = (world: World, projectId: string): number => world.project(projectId).items.size;

test('a call crosses the wire and back, a refusal arrives as one, and a change is told before its answer', async () => {
  const world = makeWorld(example), { wire, projectId, pipelines, events } = await opened(world);
  assert.equal(wire.state, 'ready');
  events.length = 0;
  let toldFirst = false;
  const added = await wire.call(Solution.method.add, { projectId, parentId: pipelines, kind: 'pipeline' }, { id: 'add-1' }).then(r => { toldFirst = events.length > 0; return r; });
  assert.ok(toldFirst);
  assert.deepEqual(events.map(e => e.store), ['Solution', 'Git', 'History']);
  assert.ok(events.every(e => e.cause === 'add-1'));
  const no = await wire.call(Solution.method.rename, { projectId, itemId: added.itemId, name: 'Customer sync' }).catch((e: unknown) => e);
  assert.ok(no instanceof Refused && no.message === '"Customer sync" already exists in Pipelines.');
  const push = await wire.call(Git.method.push, { projectId }).catch((e: unknown) => e);
  assert.ok(push instanceof Refused && push.actionLabel === 'Update' && push.actionMethod.endsWith('/Pull'), 'what a refusal offers crosses with it');
  wire.close();
});

test('a call whose message is lost is not answered, and the page is told so after its time', async () => {
  const world = makeWorld(example), faults = noFaults(), { wire, projectId, pipelines } = await opened(world, faults), before = itemCount(world, projectId);
  faults.loseRequests = 1;
  const lost = await wire.call(Solution.method.add, { projectId, parentId: pipelines, kind: 'pipeline' }).catch((e: unknown) => e);
  assert.ok(lost instanceof Unreachable);
  assert.equal(itemCount(world, projectId), before, 'nothing was carried out');
  assert.equal(wire.state, 'ready');
  assert.ok((await wire.call(Solution.method.add, { projectId, parentId: pipelines, kind: 'pipeline' })).itemId, 'the next call goes through');
  wire.close();
});

test('a command whose answer is lost is carried out once: after the connection is back it is asked again under its id and gets the answer it had', async () => {
  const world = makeWorld(example), faults = noFaults(), { wire, projectId, pipelines, states } = await opened(world, faults, { ...quick, limitMs: 2000 }), before = itemCount(world, projectId);
  faults.loseAnswers = 1;
  const call = wire.call(Solution.method.add, { projectId, parentId: pipelines, kind: 'pipeline' }, { id: 'add-once' });
  await until(() => itemCount(world, projectId) === before + 1);
  states.length = 0;
  faults.cut();
  const added = await call;
  assert.deepEqual(states, ['connecting', 'ready']);
  assert.equal(itemCount(world, projectId), before + 1, 'it was not carried out a second time');
  assert.ok(world.project(projectId).items.has(added.itemId));
  wire.close();
});

test('a call made while the connection is away waits for it and is answered when it is back', async () => {
  const world = makeWorld(example), faults = noFaults(), { wire, projectId, states } = await opened(world, faults, { ...quick, limitMs: 2000 });
  states.length = 0;
  faults.cut();
  await until(() => wire.state === 'connecting');
  const solution = await wire.call(Solution.method.read, { projectId });
  assert.ok(solution.items.length > 100);
  assert.equal(wire.state, 'ready');
  wire.close();
});

test('a storage that cannot be reached counts as offline after its tries, tells what waits, and is used again when it is back', async () => {
  const world = makeWorld(example);
  let reachable = false, tries = 0;
  const wire = new Wire('test', (): Socket => {
    tries++;
    if (!reachable) throw new Error('refused');
    const [near, far] = pair(noFaults(), () => false);
    serve(world, far);
    return near;
  }, { ...quick, limitMs: 5000 });
  const states: BackendState[] = [wire.state];
  wire.onState(s => states.push(s));
  const asked = Date.now(), waited = await wire.call(Projects.method.read, {}).catch((e: unknown) => e);
  assert.ok(waited instanceof Unreachable);
  assert.ok(Date.now() - asked < 1000, 'it is told when the storage counts as offline, well before its own time is up');
  assert.deepEqual(states, ['connecting', 'offline']);
  assert.ok(tries >= 3);
  reachable = true;
  await until(() => wire.state === 'ready');
  assert.ok((await wire.call(Projects.method.read, {})).projects.length > 0);
  wire.close();
});

test('a service that speaks another version of the protocol is not talked to', async () => {
  const wire = new Wire('test', (): Socket => {
    const [near, far] = pair(noFaults(), () => false);
    far.onmessage = data => { if (fromBinary(EnvelopeSchema, data).kind.case === 'hello') far.send(toBinary(EnvelopeSchema, create(EnvelopeSchema, { kind: { case: 'hello', value: { protocol: PROTOCOL + 1, peer: 'newer' } } }))); };
    return near;
  }, quick);
  await until(() => wire.state === 'offline');
  assert.ok(await wire.call(Projects.method.read, {}).catch((e: unknown) => e) instanceof Unreachable);
  wire.close();
});

test('a page that was cut off reads again what it missed, and is told once', async () => {
  const world = makeWorld(example), faults = noFaults();
  const mine = new Storage(loopback(world, { ...quick, limitMs: 2000 }, faults)), theirs = new Storage(loopback(world, quick));
  let told = 0;
  mine.onForeign(() => { told++; });
  for (const s of [mine, theirs]) await Promise.all([s.catalogue.load(), s.identity.load(), s.projects.load()]);
  const project = await mine.open(mine.projects.lastOpenedId), other = await theirs.open(theirs.projects.lastOpenedId);
  const find = (name: string, from = other) => [...from.solution.all()].find(x => x.name === name)!;

  /* a connection that is cut hears nothing until it is back */
  faults.cut();
  await until(() => mine.state === 'connecting');
  const added = await other.solution.add(find('Pipelines'), 'pipeline');
  await other.solution.rename(added.item, 'While you were away');
  await until(() => mine.state === 'ready');
  await until(() => !!project.solution.byId(added.item.id));
  assert.equal(project.solution.byId(added.item.id)!.name, 'While you were away');
  assert.equal(find('Pipelines', project).children!.at(-1), project.solution.byId(added.item.id));
  assert.equal(project.solution.byId(added.item.id)!.vcs, 'A');
  await wait(20);
  assert.equal(told, 1);
});
