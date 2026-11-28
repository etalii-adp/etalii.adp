/* The contract: every message of it survives the trip as bytes and as JSON, and every call of it is answered by the backend in the page. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { create, equals, fromBinary, fromJson, toBinary, toJson, type DescMessage, type DescService } from '@bufbuild/protobuf';
import { methodName, Refused } from '../../src/storage/backend';
import { empty } from '../../src/storage/backends/empty/seed';
import { example } from '../../src/storage/backends/_example';
import { makeWorld } from '../../src/storage/backends/common/server';
import * as agent from '../../src/storage/gen/adp/storage/v1/agent_pb';
import * as catalogue from '../../src/storage/gen/adp/storage/v1/catalogue_pb';
import * as common from '../../src/storage/gen/adp/storage/v1/common_pb';
import * as content from '../../src/storage/gen/adp/storage/v1/content_pb';
import * as envelope from '../../src/storage/gen/adp/storage/v1/envelope_pb';
import * as git from '../../src/storage/gen/adp/storage/v1/git_pb';
import * as history from '../../src/storage/gen/adp/storage/v1/history_pb';
import * as identity from '../../src/storage/gen/adp/storage/v1/identity_pb';
import * as kept from '../../src/storage/gen/adp/storage/v1/kept_pb';
import * as levels from '../../src/storage/gen/adp/storage/v1/levels_pb';
import * as projects from '../../src/storage/gen/adp/storage/v1/projects_pb';
import * as solution from '../../src/storage/gen/adp/storage/v1/solution_pb';
import * as status from '../../src/storage/gen/adp/storage/v1/status_pb';
import * as workbench from '../../src/storage/gen/adp/storage/v1/workbench_pb';

const files = [agent, catalogue, common, content, envelope, git, history, identity, kept, levels, projects, solution, status, workbench];
const all = files.flatMap(f => Object.values(f) as unknown[]);
const messages = all.filter((d): d is DescMessage => !!d && typeof d === 'object' && (d as { kind?: string }).kind === 'message');
const services = all.filter((d): d is DescService => !!d && typeof d === 'object' && (d as { kind?: string }).kind === 'service');

/* both trips of one message */
function trips(schema: DescMessage, bytes: Uint8Array): void {
  const message = fromBinary(schema, bytes);
  assert.ok(equals(schema, message, fromBinary(schema, toBinary(schema, message))), schema.typeName + ' as bytes');
  assert.ok(equals(schema, message, fromJson(schema, JSON.parse(JSON.stringify(toJson(schema, message))))), schema.typeName + ' as JSON');
}

test('the contract has its eleven stores and their messages', () => {
  assert.deepEqual(services.map(s => s.name).sort(), ['Agent', 'Catalogue', 'Content', 'Git', 'History', 'Identity', 'Levels', 'Projects', 'Solution', 'Status', 'Workbench']);
  assert.ok(messages.length > 50);
});

test('an empty message of every kind survives both trips', () => {
  for (const schema of messages) trips(schema, toBinary(schema, create(schema)));
});

test('every call is answered, and what it answers with survives both trips', async () => {
  for (const seed of [example, empty]) {
    const world = makeWorld({ ...seed, answerMs: 0 }), server = world.server;
    const listed = fromBinary(projects.ProjectsSnapshotSchema, await server.handle(methodName(projects.Projects.method.read), new Uint8Array(), 'read-projects'));
    const projectId = listed.lastOpenedId || listed.projects[0].id;
    await server.handle(methodName(projects.Projects.method.open), toBinary(projects.Projects.method.open.input, create(projects.Projects.method.open.input, { projectId })), 'open');
    const told: envelope.Event[] = [];
    server.watch(event => told.push(event));
    let answered = 0;
    for (const service of services) for (const method of service.methods) {
      /* what a call names is given the project and its root, where it has a field for them; whatever else it needs is left empty, and may be refused for it */
      const init: Record<string, unknown> = {};
      for (const field of method.input.fields) { if (field.localName === 'projectId') init.projectId = projectId; if (field.localName === 'itemId' || field.localName === 'parentId' || field.localName === 'ownerId') init[field.localName] = world.project(projectId).kept.solution!.rootId; }
      try {
        trips(method.output, await server.handle(methodName(method), toBinary(method.input, create(method.input, init)), `${seed.version}/${methodName(method)}`));
        answered++;
      } catch (e) { assert.ok(e instanceof Refused, `${methodName(method)}: ${e instanceof Error ? e.message : String(e)}`); }
    }
    assert.ok(answered > 20, 'most calls answer even when asked with next to nothing');
    assert.ok(told.length > 5);
    for (const event of told) {
      trips(envelope.EventSchema, toBinary(envelope.EventSchema, event));
      const schema = messages.find(m => m.typeName === `adp.storage.v1.${event.store}Changes`) ?? messages.find(m => m.typeName === `adp.storage.v1.${event.store}Snapshot`);
      assert.ok(schema, 'what the ' + event.store + ' store tells is a message of the contract');
      trips(schema, event.changes);
    }
    trips(kept.KeptProjectSchema, world.keep(projectId));
  }
});

test('an envelope of every kind survives both trips', () => {
  const kinds: envelope.Envelope['kind'][] = [
    { case: 'hello', value: create(envelope.HelloSchema, { protocol: 1, peer: 'page' }) },
    { case: 'request', value: create(envelope.RequestSchema, { id: 'a', method: 'adp.storage.v1.Solution/Rename', message: new Uint8Array([1, 2, 3]), limitMs: 8000 }) },
    { case: 'response', value: create(envelope.ResponseSchema, { id: 'a', outcome: { case: 'result', value: new Uint8Array([4, 5]) } }) },
    { case: 'response', value: create(envelope.ResponseSchema, { id: 'a', outcome: { case: 'refusal', value: { code: 'conflict', message: 'No', actionLabel: 'Update', actionMethod: 'adp.storage.v1.Git/Pull' } } }) },
    { case: 'response', value: create(envelope.ResponseSchema, { id: 'a', outcome: { case: 'fault', value: { message: 'Broken' } } }) },
    { case: 'cancel', value: create(envelope.CancelSchema, { id: 'a' }) },
    { case: 'event', value: create(envelope.EventSchema, { store: 'Solution', projectId: 'p', revision: 7, cause: 'a', user: 'u', changes: new Uint8Array([9]) }) },
    { case: 'ping', value: create(envelope.PingSchema, { nonce: 3 }) },
    { case: 'pong', value: create(envelope.PongSchema, { nonce: 3 }) },
  ];
  for (const kind of kinds) trips(envelope.EnvelopeSchema, toBinary(envelope.EnvelopeSchema, create(envelope.EnvelopeSchema, { kind })));
});
