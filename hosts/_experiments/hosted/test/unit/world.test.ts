/* The backend in the page, asked directly: every store reads, and every command does what its message says. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Refused, type Backend } from '../../src/storage/backend';
import { example } from '../../src/storage/backends/_example';
import { InPage } from '../../src/storage/backends/common/in-page';
import { makeWorld } from '../../src/storage/backends/common/server';
import { Catalogue } from '../../src/storage/gen/adp/storage/v1/catalogue_pb';
import { Content } from '../../src/storage/gen/adp/storage/v1/content_pb';
import type { Event } from '../../src/storage/gen/adp/storage/v1/envelope_pb';
import { ChangeState, Git } from '../../src/storage/gen/adp/storage/v1/git_pb';
import { History } from '../../src/storage/gen/adp/storage/v1/history_pb';
import { Identity } from '../../src/storage/gen/adp/storage/v1/identity_pb';
import { Levels, ViewMode } from '../../src/storage/gen/adp/storage/v1/levels_pb';
import { Projects } from '../../src/storage/gen/adp/storage/v1/projects_pb';
import { Solution } from '../../src/storage/gen/adp/storage/v1/solution_pb';
import { RunScope, Status } from '../../src/storage/gen/adp/storage/v1/status_pb';
import { Workbench } from '../../src/storage/gen/adp/storage/v1/workbench_pb';

async function open(): Promise<{ backend: Backend; projectId: string; events: Event[] }> {
  const backend = new InPage('memory', makeWorld(example)), events: Event[] = [];
  backend.watch(e => events.push(e));
  const projects = await backend.call(Projects.method.read, {});
  await backend.call(Projects.method.open, { projectId: projects.lastOpenedId });
  return { backend, projectId: projects.lastOpenedId, events };
}
const refused = async (run: Promise<unknown>): Promise<Refused> => { try { await run; } catch (e) { if (e instanceof Refused) return e; throw e; } throw new Error('It was not refused.'); };

test('every store reads', async () => {
  const { backend, projectId } = await open();
  const catalogue = await backend.call(Catalogue.method.read, {}), icons = await backend.call(Catalogue.method.readIcons, {});
  assert.ok(catalogue.kinds.length > 20);
  assert.ok(icons.count > 500 && icons.groups.some(g => g.domain) && icons.groups.every(g => g.icons.length > 0));
  const identity = await backend.call(Identity.method.read, {});
  assert.equal(identity.providers.length, 4);
  const solution = await backend.call(Solution.method.read, { projectId });
  assert.equal(solution.items[0].id, solution.rootId);
  assert.ok(solution.items.every(x => /^[0-9a-z]{25}$/.test(x.id)));
  assert.ok((await backend.call(Levels.method.read, { projectId })).levels.length > 0);
  const git = await backend.call(Git.method.read, { projectId });
  assert.equal(git.ahead, 1); assert.equal(git.behind, 3); assert.equal(git.commits.length, 13);
  assert.equal((await backend.call(Status.method.read, { projectId })).problems.length, 8);
  assert.equal((await backend.call(Workbench.method.read, { projectId })).tabIds.length, 4);
  assert.equal((await backend.call(History.method.read, { projectId })).entries.length, 0);
  for (const x of solution.items) {
    const doc = await backend.call(Content.method.read, { projectId, itemId: x.id });
    const tool = catalogue.kinds.find(k => k.name === x.kind)!.tool;
    if (tool && tool !== 'code' && tool !== 'entity') assert.doesNotThrow(() => JSON.parse(doc.text), x.name);
  }
});

test('validation counts the items as the project page does', async () => {
  const { backend, projectId } = await open();
  assert.equal((await backend.call(Status.method.validate, { projectId })).message, 'Validated 130 items: 2 errors, 3 warnings, 3 notes');
  assert.equal((await backend.call(Status.method.run, { projectId, scope: RunScope.TEST_SUITES })).message, '3 test suites queued on Staging');
});

test('signing in asks for the password, and the other ways answer that they are not set up', async () => {
  const { backend } = await open();
  assert.equal((await refused(backend.call(Identity.method.signIn, { workspace: 'w', email: 'e', password: 'no' }))).message, 'The email or the password is not right.');
  assert.ok((await backend.call(Identity.method.signIn, { workspace: 'w', email: 'e', password: example.password })).user);
});

test('adding, renaming and deleting tell every store, and can be taken back', async () => {
  const { backend, projectId, events } = await open();
  const solution = await backend.call(Solution.method.read, { projectId }), pipelines = solution.items.find(x => x.name === 'Pipelines')!;
  events.length = 0;
  const added = await backend.call(Solution.method.add, { projectId, parentId: pipelines.id, kind: 'pipeline' }, { id: 'call-add' });
  assert.deepEqual(events.map(e => e.store), ['Solution', 'Git', 'History']);
  assert.ok(events.every(e => e.cause === 'call-add'));
  let now = await backend.call(Solution.method.read, { projectId });
  assert.equal(now.items.find(x => x.id === added.itemId)!.name, 'New data pipeline');
  assert.equal((await backend.call(Git.method.read, { projectId })).items.find(g => g.itemId === added.itemId)!.state, ChangeState.ADDED);

  /* the same command again, under the same id, is answered as before and carried out once */
  assert.equal((await backend.call(Solution.method.add, { projectId, parentId: pipelines.id, kind: 'pipeline' }, { id: 'call-add' })).itemId, added.itemId);
  assert.equal((await backend.call(Solution.method.read, { projectId })).items.length, now.items.length);

  assert.equal((await refused(backend.call(Solution.method.rename, { projectId, itemId: added.itemId, name: 'Customer sync' }))).message, '"Customer sync" already exists in Pipelines.');
  assert.equal((await refused(backend.call(Solution.method.rename, { projectId, itemId: added.itemId, name: 'a/b' }))).message, 'A name cannot contain \\ / : * ? " < > |');
  await backend.call(Solution.method.rename, { projectId, itemId: added.itemId, name: 'Night batch' });
  assert.equal((await backend.call(Git.method.read, { projectId })).items.find(g => g.itemId === added.itemId)!.state, ChangeState.ADDED);

  const deleted = await backend.call(Solution.method.delete, { projectId, itemId: pipelines.id }, { id: 'call-delete' });
  assert.equal(deleted.message, 'Deleted Pipelines and its 5 items');
  now = await backend.call(Solution.method.read, { projectId });
  assert.ok(!now.items.some(x => x.id === added.itemId || x.id === pipelines.id));
  assert.equal((await refused(backend.call(History.method.undo, { projectId, entryId: 'call-add' }))).code, 'later-changes');
  await backend.call(History.method.undo, { projectId, entryId: 'call-delete' });
  now = await backend.call(Solution.method.read, { projectId });
  assert.equal(now.items.find(x => x.id === added.itemId)!.name, 'Night batch');
  assert.equal((await backend.call(History.method.undo, { projectId })).message, 'Undid: Rename New data pipeline to Night batch');
  assert.equal((await backend.call(History.method.redo, { projectId })).message, 'Redid: Rename New data pipeline to Night batch');
  assert.equal((await refused(backend.call(Solution.method.delete, { projectId, itemId: solution.rootId }))).message, 'The project root stays');
});

test('a linked repository is read-only inside, and follows a branch or a tag', async () => {
  const { backend, projectId } = await open();
  const solution = await backend.call(Solution.method.read, { projectId }), linked = solution.items.find(x => x.link)!, inside = solution.items.find(x => x.parentId === linked.id)!;
  assert.match((await refused(backend.call(Solution.method.rename, { projectId, itemId: inside.id, name: 'Other' }))).message, /^Read-only, from /);
  const other = linked.link!.refs.find(r => r !== linked.link!.ref)!;
  assert.equal((await backend.call(Solution.method.setRef, { projectId, itemId: linked.id, ref: other })).message, `${linked.name} now follows ${other}`);
  const made = await backend.call(Solution.method.link, { projectId, parentId: solution.suggestedLinkParentId, repository: solution.suggestedLink!.repository, name: solution.suggestedLinkName, ref: 'main' });
  assert.equal(made.message, 'Notification service is linked. Its items continue the hierarchy here.');
});

test('a level keeps how it shows and its own layout', async () => {
  const { backend, projectId } = await open();
  const solution = await backend.call(Solution.method.read, { projectId }), sources = solution.items.find(x => x.name === 'Sources')!;
  assert.equal((await backend.call(Levels.method.setView, { projectId, itemId: sources.id, view: ViewMode.LOGICAL })).message, 'Sources now shows as Logical Structure. Saved in its .user.adp');
  assert.equal((await backend.call(Levels.method.read, { projectId })).levels.find(l => l.itemId === sources.id)!.view, ViewMode.UNSPECIFIED);
  await backend.call(Levels.method.setLayout, { projectId, itemId: sources.id, places: [{ itemId: sources.children[0], x: 10, y: 20 }] });
  assert.equal((await backend.call(Levels.method.read, { projectId })).levels.find(l => l.itemId === sources.id)!.ownLayout[0].y, 20);
});

test('writing a document needs the revision it was read at', async () => {
  const { backend, projectId } = await open();
  const solution = await backend.call(Solution.method.read, { projectId }), schema = solution.items.find(x => x.kind === 'schema')!;
  const doc = await backend.call(Content.method.read, { projectId, itemId: schema.id });
  await backend.call(Content.method.write, { projectId, itemId: schema.id, baseRevision: doc.revision, text: doc.text });
  assert.equal((await refused(backend.call(Content.method.write, { projectId, itemId: schema.id, baseRevision: doc.revision, text: doc.text }))).code, 'conflict');
  assert.equal((await backend.call(Git.method.read, { projectId })).items.find(g => g.itemId === schema.id)!.state, ChangeState.MODIFIED);
});

test('committing, updating and pushing move the log and the counters', async () => {
  const { backend, projectId } = await open();
  let git = await backend.call(Git.method.read, { projectId });
  const files = git.changes.flatMap(g => g.files.map(f => ({ itemId: g.itemId, path: f.path })));
  assert.equal(files.length, 10);
  assert.equal((await refused(backend.call(Git.method.commit, { projectId, message: ' ', files }))).message, 'Write a commit message first.');
  assert.equal((await backend.call(Git.method.commit, { projectId, message: 'Work', files })).message, 'Committed 10 files to develop');
  assert.equal((await refused(backend.call(Git.method.push, { projectId }))).actionLabel, 'Update');
  assert.equal((await backend.call(Git.method.pull, { projectId })).message, 'Merged 3 incoming commits into develop');
  assert.equal((await backend.call(Git.method.push, { projectId })).message, 'Pushed 3 commits to origin/develop');
  assert.equal((await backend.call(Git.method.push, { projectId })).message, 'Nothing to push');
  git = await backend.call(Git.method.read, { projectId });
  assert.equal(git.commits.length, 15); assert.equal(git.changes.length, 0); assert.equal(git.ahead + git.behind, 0);
  assert.ok(git.items.every(g => g.state === ChangeState.UNSPECIFIED));
  assert.equal((await backend.call(Git.method.fetch, { projectId })).message, 'Fetched origin. Nothing new since 4 minutes ago.');
});

test('a project that is not on this computer says so', async () => {
  const { backend } = await open(), projects = await backend.call(Projects.method.read, {});
  assert.equal((await refused(backend.call(Projects.method.open, { projectId: projects.projects[1].id }))).message, 'Only Atlas Platform is available on this computer.');
});
