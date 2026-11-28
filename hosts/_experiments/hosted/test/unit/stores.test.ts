/* The stores, as a page uses them: what they read, that a command shows in the views a page already holds, and that a second page hears of it. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Refused, Storage, type Item, type OntologyDocument, type ProjectStorage, type SchemaDocument } from '../../src/storage';
import { empty } from '../../src/storage/backends/empty/seed';
import { example } from '../../src/storage/backends/_example';
import { InPage } from '../../src/storage/backends/common/in-page';
import { makeWorld } from '../../src/storage/backends/common/server';
import type { World } from '../../src/storage/backends/common/server/core';

/* a page on a world: its storage, the project that opens, and how often it was told of a change it did not make */
async function page(world: World = makeWorld(example)): Promise<{ storage: Storage; project: ProjectStorage; told: () => number; world: World }> {
  const storage = new Storage(new InPage('memory', world));
  let told = 0;
  storage.onForeign(() => { told++; });
  await Promise.all([storage.catalogue.load(), storage.catalogue.loadIcons(), storage.identity.load(), storage.projects.load()]);
  return { storage, project: await storage.open(storage.projects.lastOpenedId), told: () => told, world };
}
const named = (project: ProjectStorage, name: string): Item => { for (const x of project.solution.all()) if (x.name === name) return x; throw new Error('No item is called ' + name); };
const refused = async (run: Promise<unknown>): Promise<Refused> => { try { await run; } catch (e) { if (e instanceof Refused) return e; throw e; } throw new Error('It was not refused.'); };
/* long enough for what a store tells in a microtask to have been told */
const soon = (): Promise<void> => new Promise(done => setTimeout(done, 5));

test('a project opens with its hierarchy, and every store says something about its items', async () => {
  const { storage, project } = await page(), root = project.solution.root;
  assert.equal(root.parent, null);
  assert.ok(root.children!.length > 5 && root.children!.every(k => k.parent === root));
  assert.equal(storage.catalogue.kind(root.kind).label.length > 0, true);
  assert.equal(storage.catalogue.kind('no-such-kind').icon, 'file');
  assert.ok(storage.catalogue.options('attribute-types').includes('datetime'));
  assert.ok(storage.catalogue.icons.count > 500 && storage.catalogue.icons.byDomain.length > 50);
  assert.equal(storage.identity.user.initials.length, 2);
  assert.ok(storage.projects.list.some(p => p.asset) && storage.projects.list.some(p => p.errors > 0));
  assert.ok([...project.solution.all()].some(x => x.vcs === 'M') && [...project.solution.all()].some(x => x.vcs === 'A'));
  assert.ok(project.status.problems.every(p => project.solution.has(p.node)));
  assert.ok(project.git.commits.length > 10 && project.git.changes.length > 0 && project.git.refs.some(r => r.kind === 'tag'));
  assert.equal(project.workbench.state.tabIds.length, 4);
  assert.equal(project.history.undoLabel, '');
  const meter = named(project, 'Asset model').children!.find(e => e.name === 'Meter')!;
  assert.ok(meter.attrs!.length > 2 && meter.req!.length === meter.attrs!.length && meter.ex !== undefined);
  assert.ok(named(project, 'Asset model').rels!.every(r => project.solution.has(r[0]) && project.solution.has(r[1])));
});

test('a project that is not on this computer is refused with the reason', async () => {
  const { storage } = await page(), other = storage.projects.list.find(p => p.id !== storage.projects.lastOpenedId)!;
  assert.match((await refused(storage.open(other.id))).message, /^Only .* is available on this computer\.$/);
});

test('an item that is deleted and brought back by Undo is the same object, where it was', async () => {
  const { project, told } = await page(), x = named(project, 'Weather enrichment'), parent = x.parent!, at = parent.children!.indexOf(x);
  const done = await project.solution.remove(x);
  assert.equal(done.message, 'Deleted Weather enrichment');
  assert.ok(!project.solution.has(x) && !parent.children!.includes(x));
  assert.equal(project.history.undoLabel, 'Delete Weather enrichment');
  await project.history.undo(done.undo);
  assert.ok(project.solution.has(x));
  assert.equal(parent.children!.indexOf(x), at);
  assert.equal(project.solution.byId(x.id), x);
  assert.equal(project.history.redoLabel, 'Delete Weather enrichment');
  await project.history.redo();
  assert.ok(!project.solution.has(x));
  await soon();
  assert.equal(told(), 0, 'a page is not told of what it did itself');
});

test('adding and renaming show in the views, and a name that is taken is refused', async () => {
  const { project } = await page(), pipelines = named(project, 'Pipelines'), count = pipelines.children!.length;
  const made = await project.solution.add(pipelines, 'pipeline');
  assert.equal(pipelines.children!.at(-1), made.item);
  assert.equal(pipelines.children!.length, count + 1);
  assert.ok(made.item.fresh && made.item.vcs === 'A');
  assert.equal((await refused(project.solution.rename(made.item, 'Customer sync'))).message, '"Customer sync" already exists in Pipelines.');
  await project.solution.rename(made.item, 'Night batch');
  assert.equal(made.item.name, 'Night batch');
  assert.equal(project.git.changes.some(c => c.node === made.item), true);
  assert.equal(project.content.doc(made.item), undefined, 'a document is on its way when it is first asked for');
});

test('a document arrives after it was asked for, and an edit of an entity type is written into its model', async () => {
  const { project } = await page(), model = named(project, 'Asset model'), meter = model.children!.find(e => e.name === 'Meter')!, schema = named(project, 'Meter reading');
  let arrived = 0;
  project.content.onArrive(() => { arrived++; });
  assert.equal(project.content.doc<SchemaDocument>(schema), undefined);
  await soon();
  assert.equal(arrived, 1);
  const read = project.content.doc<SchemaDocument>(schema)!;
  assert.ok(read.fields.length > 3 && read.usedBy!.every(id => !!project.solution.byId(id)));

  const doc = structuredClone(project.content.doc<OntologyDocument>(model)) as OntologyDocument;
  doc.entities[meter.id].attrs.push('firmware: text');
  const customer = named(project, 'Customer model').children!.find(e => e.name === 'Contract')!, theirs = structuredClone(project.content.doc<OntologyDocument>(customer.parent!)) as OntologyDocument;
  assert.equal(customer.vcs, undefined);
  theirs.entities[customer.id].attrs.push('signedOn: date');
  await project.content.write(customer.parent!, theirs, customer);
  assert.equal(customer.attrs!.at(-1), 'signedOn: date');
  assert.equal(customer.vcs, 'M', 'the entity type shows as changed');
  assert.equal(customer.parent!.vcs, undefined, 'and its model does not, for it');
  await project.content.write(model, doc, meter);
  assert.equal(meter.attrs!.at(-1), 'firmware: text');
  await project.history.undo();
  assert.notEqual(meter.attrs!.at(-1), 'firmware: text', 'at once, not a moment later');
  assert.equal(customer.attrs!.at(-1), 'signedOn: date');
});

test('a second page hears of a change once, and a write on what is no longer there is refused and read again', async () => {
  const one = await page(), two = await page(one.world), schema = named(one.project, 'Meter reading'), theirs = named(two.project, 'Meter reading');
  one.project.content.doc(schema); two.project.content.doc(theirs);
  await soon();
  const doc = structuredClone(one.project.content.doc<SchemaDocument>(schema)) as SchemaDocument;
  doc.fields[0][0] = 'meterNumber';
  await one.project.content.write(schema, doc);
  await soon();
  assert.equal(one.told(), 0);
  assert.equal(two.told(), 1);
  assert.equal(theirs.vcs, 'M');
  assert.equal(two.project.content.doc<SchemaDocument>(theirs)!.fields[0][0], 'meterNumber');

  /* the second page writes from what it read before a third change it has not heard of yet */
  const stale = structuredClone(two.project.content.doc<SchemaDocument>(theirs)) as SchemaDocument;
  const world = one.world, state = world.project(one.project.info.id), held = state.documents.get(schema.id)!;
  held.revision += 1;
  assert.equal((await refused(two.project.content.write(theirs, stale))).code, 'conflict');
  await soon();
  assert.notEqual(two.project.content.doc(theirs), undefined, 'it is read again');

  const added = await one.project.solution.add(named(one.project, 'Pipelines'), 'pipeline');
  await soon();
  assert.equal(two.project.solution.byId(added.item.id)?.name, added.item.name);
  assert.equal(two.told(), 2);
});

test('a level keeps how it shows and where its cards are, for this person', async () => {
  const { project } = await page(), level = named(project, 'Sources'), card = level.children![0];
  await project.levels.setLayout(level, new Map([[card.id, { x: 12, y: 34 }]]));
  assert.deepEqual(level.own!.get(card.id), { x: 12, y: 34 });
  await project.levels.resetLayout(level);
  assert.equal(level.own, undefined);
  await project.levels.setView(level, 'files');
  assert.equal(level.mode, 'files');
  await project.levels.setShowAll(level, true);
  assert.equal(level.showAll, true);
  await project.git.setIgnored(level, 'notes.txt', true);
  assert.equal(project.git.ignores(level, 'notes.txt'), true);
  assert.equal(project.git.ignores(level, 'other.txt'), undefined);
});

test('a commit takes the chosen files, clears their marks and ends what Undo can take back', async () => {
  const { project } = await page(), pipelines = named(project, 'Pipelines');
  await project.solution.add(pipelines, 'pipeline');
  assert.notEqual(project.history.undoLabel, '');
  const files = project.git.changes.flatMap(c => c.files.map(f => ({ node: c.node, f: f.f }))), keep = files.pop()!;
  assert.equal((await refused(project.git.commit('', files, false))).message, 'Write a commit message first.');
  const before = project.git.commits.length;
  assert.equal((await project.git.commit('Work', files, false)).message, `Committed ${files.length} files to develop`);
  assert.equal(project.git.commits.length, before + 1);
  assert.equal(project.git.commits[0].m, 'Work');
  assert.ok(project.git.commits[0].touched.length > 0);
  assert.deepEqual(project.git.changes.map(c => c.node), [keep.node]);
  assert.equal(project.history.undoLabel, '');
  const push = await refused(project.git.push());
  assert.equal(push.actionLabel, 'Update');
  assert.equal((await project.action(push.actionMethod)!()).message, 'Merged 3 incoming commits into develop');
  assert.equal(project.git.behind, 0);
});

test('validation and runs answer in words, and the window keeps its state', async () => {
  const one = await page();
  assert.match((await one.project.status.validate()).message, /^Validated \d+ items: 2 errors, 3 warnings, 3 notes$/);
  assert.match((await one.project.status.run(named(one.project, 'Pipeline regression'))).message, / queued on /);
  assert.match((await one.project.status.run(one.project.status.defaultRun!, true)).message, / started$/);
  const state = { ...one.project.workbench.state, selectedId: named(one.project, 'Pipelines').id, commitMessage: 'Half a message' };
  one.project.workbench.keepSoon(() => state);
  one.project.workbench.keepNow();
  await soon();
  const two = await page(one.world);
  assert.equal(two.project.workbench.state.selectedId, state.selectedId);
  assert.equal(two.project.workbench.state.commitMessage, 'Half a message');
  await soon();
  assert.equal(one.told() + two.told(), 0, 'nobody is told of a window keeping its own state');
});

test('a storage that holds nothing yet still gives a project to work in', async () => {
  const storage = new Storage(new InPage('empty', makeWorld(empty)));
  await Promise.all([storage.catalogue.load(), storage.catalogue.loadIcons(), storage.identity.load(), storage.projects.load()]);
  assert.equal(storage.projects.list.length, 1);
  const project = await storage.open(storage.projects.list[0].id), root = project.solution.root;
  assert.deepEqual(root.children, []);
  assert.equal(project.status.problems.length + project.git.changes.length, 0);
  const made = await project.solution.add(root, 'group');
  assert.equal(root.children![0], made.item);
  const doc = await project.solution.add(made.item, 'doc');
  project.content.doc(doc.item);
  await soon();
  assert.equal(project.content.doc(doc.item), null, 'nothing was written of it yet');
  await project.content.write(doc.item, { html: '<p>First words</p>' });
  assert.deepEqual(project.content.doc(doc.item), { html: '<p>First words</p>' });
});
