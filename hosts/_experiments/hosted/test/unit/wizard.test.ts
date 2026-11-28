/* The New Project wizard: what it asks, that its sizes, questions and recipes fit each other and the catalogue, and the project that is made of the answers. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fromBinary } from '@bufbuild/protobuf';
import { Refused, Storage, type Item, type ProjectStorage, type RecipeElementInfo, type TextDocument } from '../../src/storage';
import { AREAS, QUESTIONS, RECIPES, SIZES } from '../../src/storage/backends/common/catalogue/wizard';
import { empty } from '../../src/storage/backends/empty/seed';
import { example } from '../../src/storage/backends/_example';
import { InPage } from '../../src/storage/backends/common/in-page';
import { makeWorld } from '../../src/storage/backends/common/server';
import type { World } from '../../src/storage/backends/common/server/core';
import { loopback } from '../../src/storage/backends/loopback';
import { KeptProjectSchema } from '../../src/storage/gen/adp/storage/v1/kept_pb';

/* a page on a world, with the wizard read; told counts what the page as a whole was told, listed what the list of projects was */
async function page(world: World = makeWorld({ ...example, answerMs: 0 })): Promise<{ storage: Storage; told: () => number; listed: () => number; world: World }> {
  const storage = new Storage(new InPage('memory', world));
  let told = 0, listed = 0;
  storage.onForeign(() => { told++; });
  await Promise.all([storage.catalogue.load(), storage.catalogue.loadIcons(), storage.catalogue.loadWizard(), storage.identity.load(), storage.projects.load()]);
  storage.projects.onChange(() => { listed++; });
  return { storage, told: () => told, listed: () => listed, world };
}
const refused = async (run: Promise<unknown>): Promise<Refused> => { try { await run; } catch (e) { if (e instanceof Refused) return e; throw e; } throw new Error('It was not refused.'); };
const soon = (ms = 5): Promise<void> => new Promise(done => setTimeout(done, ms));
const names = (x: Item): string[] => (x.children ?? []).map(k => k.name);
const child = (x: Item, name: string): Item => { const found = (x.children ?? []).find(k => k.name === name); if (!found) throw new Error(`${x.name} holds no ${name}: ${names(x).join(', ')}`); return found; };
/* a document, once it has arrived */
async function read<T>(project: ProjectStorage, x: Item): Promise<T | null> { for (let i = 0; i < 20; i++) { const d = project.content.doc<T>(x); if (d !== undefined) return d as T | null; await soon(); } throw new Error('The document did not arrive.'); }
/* the icons every page has, by the names in the module that draws them; it draws on a page, so it cannot be loaded here */
const builtIn = new Set([...readFileSync('src/common/icons.ts', 'utf8').matchAll(/^\s*([\w-]+):/gm)].map(m => m[1]));
/* an icon is drawn when the catalogue brings its drawing, or every page has it */
const drawn = (storage: Storage, icon: string): boolean => !!storage.catalogue.icons.drawings[icon] || builtIn.has(icon);
/* a web application as the wizard suggests it */
const web = { sizeId: 'web', optionIds: ['typescript', 'react', 'postgres', 'paas', 'tests', 'cicd', 'docs'] };
const all = (storage: Storage, answers: { sizeId: string; optionIds: string[] }): string[] => storage.catalogue.recipesFor(answers.sizeId, answers.optionIds).map(r => r.id);

test('the sizes go from a console application up to a solution on a platform, and each suggests what it is asked about', async () => {
  const { storage } = await page(), { catalogue } = storage;
  assert.deepEqual(catalogue.sizes.map(s => s.id), ['console', 'web', 'mobile', 'service', 'distributed', 'platform']);
  assert.deepEqual(catalogue.sizes.map(s => s.scale), [1, 2, 3, 4, 5, 6]);
  for (const s of catalogue.sizes) {
    assert.ok(s.label && s.about && s.parts.length > 1, s.id);
    assert.ok(drawn(storage, s.icon), `${s.id} has an icon that is drawn`);
    const asked = catalogue.questionsFor(s.id), options = new Set(asked.flatMap(q => q.options.map(o => o.id)));
    assert.ok(asked.some(q => q.step === 'technology') && asked.some(q => q.step === 'delivery'), s.id);
    for (const id of s.suggests) assert.ok(options.has(id), `${s.id} suggests ${id}, which it is not asked about`);
    assert.ok(catalogue.recipesFor(s.id, s.suggests).length >= 3, `${s.id} starts with recipes`);
  }
  /* a larger solution is asked more, and offered more */
  assert.ok(catalogue.questionsFor('console').length < catalogue.questionsFor('platform').length);
  assert.ok(!catalogue.questionsFor('console').some(q => q.id === 'web') && catalogue.questionsFor('web').some(q => q.id === 'web'));
  assert.ok(catalogue.recipesFor('console', catalogue.sizes[0].suggests).length < catalogue.recipesFor('platform', catalogue.sizes[5].suggests).length);
  assert.deepEqual(catalogue.questionsFor('no-such-size').map(q => q.id), QUESTIONS.filter(q => !q.sizes?.length).map(q => q.id));
});

test('every option brings a recipe, and every recipe is made of what the catalogue knows and its level takes', async () => {
  const { storage } = await page(), { catalogue } = storage;
  const optionIds = QUESTIONS.flatMap(q => q.options!.map(o => o.id!)), ids = new Set<string>();
  assert.equal(new Set(optionIds).size, optionIds.length, 'no option is there twice');
  for (const q of QUESTIONS) for (const o of q.options!) {
    const sizes = q.sizes?.length ? q.sizes : SIZES.map(s => s.id!);
    for (const size of sizes) assert.ok(RECIPES.some(r => (!r.sizes?.length || r.sizes.includes(size)) && r.needs?.includes(o.id!)), `${o.id} brings nothing for ${size}`);
  }
  for (const r of RECIPES) {
    assert.ok(!ids.has(r.id!), `${r.id} is there twice`); ids.add(r.id!);
    assert.ok(r.name && r.about && r.elements!.length, r.id);
    for (const need of r.needs ?? []) assert.ok(optionIds.includes(need), `${r.id} needs ${need}, which nobody can choose`);
    for (const size of r.sizes ?? []) {
      assert.ok(SIZES.some(s => s.id === size), `${r.id} is for ${size}`);
      /* what it needs can be chosen for that size */
      for (const need of r.needs ?? []) { const q = QUESTIONS.find(x => x.options!.some(o => o.id === need))!; assert.ok(!q.sizes?.length || q.sizes.includes(size), `${r.id} needs ${need}, which ${size} is not asked`); }
    }
    const area = AREAS.find(a => a.name === r.area);
    assert.ok(area, `${r.id} goes in ${r.area}`);
    for (const e of r.elements!) assert.ok(area.accepts!.includes(e.kind!), `${r.area} does not take the ${e.kind} of ${r.id}`);
  }
  for (const a of AREAS) assert.ok(drawn(storage, a.icon!) && RECIPES.some(r => r.area === a.name), a.name);
  /* as a page reads them: every element is of a kind the catalogue knows, with an icon that is drawn, in a level that takes it */
  const wizard = SIZES.flatMap(s => catalogue.recipesFor(s.id!, optionIds));
  assert.equal(new Set(wizard.map(r => r.id)).size, RECIPES.length, 'every recipe is offered for some size');
  const raw = new Map(RECIPES.map(r => [r.id!, r]));
  const fits = (e: RecipeElementInfo, accepts: readonly string[] | undefined, of: string): void => {
    const kind = catalogue.kinds[e.kind];
    assert.ok(kind, `${of}: ${e.kind} is no kind`);
    assert.ok(drawn(storage, e.icon || kind.icon), `${of}: no icon ${e.icon || kind.icon}`);
    if (accepts) assert.ok(accepts.includes(e.kind), `${of}: ${e.name} is a ${e.kind} where only ${accepts.join(', ')} go`);
  };
  type Raw = NonNullable<(typeof RECIPES)[number]['elements']>[number];
  const walk = (e: RecipeElementInfo, was: Raw, of: string): void => {
    const takes = was.accepts?.length ? was.accepts : catalogue.takes[e.kind] ?? [];
    assert.equal(e.children.length, was.children?.length ?? 0);
    e.children.forEach((c, i) => { fits(c, takes, `${of} › ${e.name}`); walk(c, was.children![i] as Raw, `${of} › ${e.name}`); });
  };
  for (const r of wizard) {
    assert.equal(r.count, JSON.stringify(r.elements).split('"name"').length - 1, `${r.id} counts its elements`);
    r.elements.forEach((e, i) => { fits(e, undefined, r.id); walk(e, raw.get(r.id)!.elements![i] as Raw, r.id); });
  }
});

test('the recipes that are kept become the hierarchy, a group two recipes share is made once, and the project opens with its brief', async () => {
  const { storage, told } = await page();
  const before = storage.projects.list.length, recipeIds = all(storage, web);
  assert.ok(recipeIds.includes('quality-tests') && recipeIds.includes('quality-e2e'));
  const made = await storage.projects.create({ name: '  Harbour   Logistics ', ...web, recipeIds });
  assert.equal(made.name, 'Harbour Logistics');
  assert.equal(made.id.length, 25);
  assert.equal(made.initials, 'HL');
  assert.equal(made.path, '~/git/harbour-logistics');
  assert.equal(made.branch, 'main');
  assert.equal(made.opened, 'Just now');
  assert.match(made.about, /^Web application · \d+ items from \d+ recipes$/);
  assert.equal(storage.projects.list.length, before + 1);
  assert.equal(storage.projects.list[0].id, made.id, 'it is the first of the list');
  assert.equal(storage.projects.lastOpenedId, made.id);

  const project = await storage.open(made.id), root = project.solution.root;
  assert.equal(root.name, 'Harbour Logistics');
  assert.equal(root.kind, 'solution');
  /* the areas come in the order the wizard lists them, and only the ones something was put in */
  assert.deepEqual(names(root), ['Services', 'Web', 'Data', 'Platform', 'Delivery', 'Quality', 'Documentation', 'Project brief']);
  assert.ok(root.children!.slice(0, -1).every(a => a.kind === 'area' && a.children!.length > 0));
  /* both recipes of tests put theirs in the one group */
  const tests = child(child(root, 'Quality'), 'Tests');
  assert.equal(child(root, 'Quality').children!.filter(k => k.name === 'Tests').length, 1);
  const wizardTests = storage.catalogue.recipesFor(web.sizeId, web.optionIds).filter(r => r.id.startsWith('quality-')).flatMap(r => r.elements.filter(e => e.name === 'Tests').flatMap(e => e.children.map(c => c.name)));
  assert.ok(wizardTests.length >= 2);
  assert.deepEqual(names(tests), wizardTests);
  /* what was counted is what was made */
  const items = [...project.solution.all()].filter(x => x.parent && x.kind !== 'area' && x.name !== 'Project brief').length;
  assert.equal(made.about, `Web application · ${items} items from ${recipeIds.length} recipes`);
  assert.equal(items, storage.catalogue.recipesFor(web.sizeId, web.optionIds).reduce((n, r) => n + r.count, 0) - 1, 'but the group that was shared, which is there once');
  for (const x of project.solution.all()) assert.equal(x.id.length, 25);
  assert.equal(new Set([...project.solution.all()].map(x => x.id)).size, [...project.solution.all()].length);

  /* nothing is written but the brief, which says what the wizard was told */
  const brief = child(root, 'Project brief'), text = (await read<TextDocument>(project, brief))!.html;
  assert.match(text, /^<h1>Harbour Logistics<\/h1><p>Harbour Logistics was started as a web application\./);
  assert.match(text, /<li><strong>Web front end<\/strong>: React<\/li>/);
  assert.match(text, /<li><strong>Languages and runtimes<\/strong>: TypeScript on Node\.js<\/li>/);
  assert.match(text, /<li><strong>React web client<\/strong>, in Web\. /);
  const source = [...project.solution.all()].find(x => x.kind === 'srcfile')!;
  assert.equal(await read(project, source), null, 'a file of a recipe is empty');
  /* the project is a repository with one commit, and nothing to commit or to fix */
  assert.equal(project.git.commits.length, 1);
  assert.equal(project.git.commits[0].m, `Start Harbour Logistics from ${recipeIds.length} recipes`);
  assert.equal(project.git.branch, 'main');
  assert.equal(project.git.changes.length + project.status.problems.length, 0);
  assert.ok([...project.solution.all()].every(x => x.vcs === undefined));
  assert.match(source.lastChange ?? '', /, today$/);
  assert.equal(project.history.undoLabel, '');
  assert.deepEqual(project.workbench.state.tabIds, [root.id, brief.id]);
  assert.equal(project.agent.conversations.length, 0, 'nobody spoke with the agent about it yet');
  assert.equal(told(), 0, 'the page that made it is not told to draw everything again');
});

test('a made project is composed further as any other, and Undo leaves it what it is', async () => {
  const { storage } = await page(), made = await storage.projects.create({ name: 'Ledger', sizeId: 'console', optionIds: ['csharp'], recipeIds: ['console-csharp'] });
  const project = await storage.open(made.id), root = project.solution.root;
  assert.deepEqual(names(root), ['Applications', 'Project brief']);
  const app = child(root, 'Applications').children![0];
  assert.equal(app.kind, 'csapp');
  /* the area takes more of what the recipe put there, and the root takes another area */
  const second = await project.solution.add(child(root, 'Applications'), 'csapp');
  assert.equal(second.item.parent, child(root, 'Applications'));
  const area = await project.solution.add(root, 'area');
  assert.equal(area.item.vcs, 'A');
  assert.ok(project.git.changes.length > 0);
  await project.solution.rename(app, 'Ledger tool');
  await project.history.undo();
  await project.history.undo();
  await project.history.undo();
  assert.deepEqual(names(root), ['Applications', 'Project brief']);
  assert.equal(project.git.changes.length, 0);
  /* it is still a project that was made here: nothing of the example is written into it */
  const file = [...project.solution.all()].find(x => x.kind === 'csharp')!;
  assert.equal(await read(project, file), null);
  await project.history.redo();
  assert.equal(await read(project, file), null);
  assert.equal(storage.projects.list[0].name, 'Ledger');
  /* the agent answers about it from what is there */
  const id = await project.agent.ask('What is in this project?');
  await soon(20);
  assert.match(project.agent.messages(id)!.at(-1)!.text, /Ledger/);
});

test('only what is offered for the answers is made, and no recipe gives a hierarchy with only the brief', async () => {
  const { storage } = await page();
  /* a recipe for another size, one whose option was not chosen, and one that does not exist */
  const made = await storage.projects.create({ name: 'Small', sizeId: 'console', optionIds: ['python'], recipeIds: ['console-python', 'console-csharp', 'web-react', 'no-such-recipe'] });
  assert.equal(made.about, `Console application · ${storage.catalogue.recipesFor('console', ['python']).find(r => r.id === 'console-python')!.count} items from 1 recipe`);
  const project = await storage.open(made.id);
  assert.deepEqual(names(project.solution.root), ['Applications', 'Project brief']);
  assert.equal(child(project.solution.root, 'Applications').children![0].kind, 'pyproject');

  const bare = await storage.projects.create({ name: 'Bare', sizeId: 'service', optionIds: [], recipeIds: [] });
  assert.equal(bare.about, 'Backend service · 0 items from 0 recipes');
  const none = await storage.open(bare.id);
  assert.deepEqual(names(none.solution.root), ['Project brief']);
  assert.match((await read<TextDocument>(none, none.solution.root.children![0]))!.html, /No recipe was chosen, so the hierarchy starts empty\./);
  const first = await none.solution.add(none.solution.root, 'area');
  assert.equal(first.item.parent, none.solution.root);
  /* the two were made after each other: their badges differ, and both are listed before the ones that were there */
  assert.notEqual(made.colour, bare.colour);
  assert.deepEqual(storage.projects.list.slice(0, 2).map(p => p.name), ['Bare', 'Small']);
});

test('a project without a name, with a name that is taken or cannot be a folder, or of no kind is refused in words', async () => {
  const { storage, world } = await page(), count = storage.projects.list.length, taken = storage.projects.list[0].name;
  const ask = (name: string, sizeId = 'web') => refused(storage.projects.create({ name, sizeId, optionIds: [], recipeIds: [] }));
  assert.deepEqual([(await ask('   ')).code, (await ask('   ')).message], ['invalid', 'A project needs a name.']);
  assert.equal((await ask('a/b')).message, 'A name cannot contain \\ / : * ? " < > |');
  assert.deepEqual([(await ask(taken.toUpperCase())).code, (await ask(taken.toUpperCase())).message], ['taken', `There is already a project called "${taken.toUpperCase()}".`]);
  assert.equal((await ask('Fine', 'no-such-size')).message, 'Choose what kind of solution it is.');
  assert.equal(storage.projects.list.length, count);
  assert.equal(world.projects.projects.length, count);
  await storage.projects.create({ name: 'Fine', sizeId: 'web', optionIds: [], recipeIds: [] });
  assert.equal((await ask('fine')).code, 'taken', 'the name of a project that was made is taken as well');
});

test('another window hears of the project in its list, and is not told to draw everything again', async () => {
  const world = makeWorld(example), mine = await page(world), other = await page(world), count = other.storage.projects.list.length;
  const made = await mine.storage.projects.create({ name: 'Shared', ...web, recipeIds: all(mine.storage, web) });
  await soon();
  assert.equal(other.storage.projects.list.length, count + 1);
  assert.equal(other.storage.projects.list[0].id, made.id);
  assert.equal(other.listed(), 1);
  assert.equal(other.told() + mine.told(), 0);
  /* and it opens there, with the same hierarchy */
  const theirs = await other.storage.open(made.id), ours = await mine.storage.open(made.id);
  assert.deepEqual([...theirs.solution.all()].map(x => x.id), [...ours.solution.all()].map(x => x.id));
});

test('what is kept of a made project brings it back in a world that starts again, on the example and on an empty storage', async () => {
  for (const seed of [example, empty]) {
    const world = makeWorld(seed), carried: [string, Uint8Array][] = [];
    world.made = (id, bytes) => { carried.push([id, bytes]); };
    const { storage } = await page(world), count = storage.projects.list.length;
    const made = await storage.projects.create({ name: 'Carried', ...web, recipeIds: all(storage, web) });
    assert.equal(carried.length, 1);
    assert.equal(carried[0][0], made.id);
    const kept = fromBinary(KeptProjectSchema, carried[0][1]);
    assert.equal(kept.made?.name, 'Carried');
    assert.equal(kept.seed, seed.version);
    const hierarchy = [...(await storage.open(made.id)).solution.all()].map(x => `${x.id} ${x.name}`);

    /* the next page: a world from the seed, and what was carried */
    const next = await page(makeWorld(seed, carried));
    assert.equal(next.storage.projects.list.length, count + 1);
    assert.deepEqual(next.storage.projects.list[0], { ...made });
    const again = await next.storage.open(made.id);
    assert.deepEqual([...again.solution.all()].map(x => `${x.id} ${x.name}`), hierarchy);
    assert.equal((await refused(next.storage.projects.create({ name: 'carried', sizeId: 'web', optionIds: [], recipeIds: [] }))).code, 'taken');
    /* what was kept for another seed is left alone */
    const elsewhere = await page(makeWorld({ ...seed, version: seed.version + '-next' }, carried));
    assert.equal(elsewhere.storage.projects.list.length, count);
  }
});

test('the wizard and the project it makes cross the wire, and a second page at the same service lists the project', async () => {
  const world = makeWorld(example), quick = { limitMs: 150, retryMs: [5, 5, 5], pingMs: 0 };
  const mine = new Storage(loopback(world, quick)), other = new Storage(loopback(world, quick));
  for (const storage of [mine, other]) await Promise.all([storage.catalogue.load(), storage.catalogue.loadWizard(), storage.projects.load()]);
  assert.equal(mine.catalogue.sizes.length, 6);
  assert.deepEqual(mine.catalogue.recipesFor(web.sizeId, web.optionIds), other.catalogue.recipesFor(web.sizeId, web.optionIds));
  assert.equal(mine.catalogue.brief, 'Project brief');
  let listed = 0;
  other.projects.onChange(() => { listed++; });
  const made = await mine.projects.create({ name: 'Across', ...web, recipeIds: all(mine, web) });
  assert.equal((await refused(mine.projects.create({ name: 'Across', ...web, recipeIds: [] }))).message, 'There is already a project called "Across".');
  await soon(20);
  assert.equal(listed, 1);
  assert.deepEqual(other.projects.list[0], made);
  const project = await other.open(made.id);
  assert.deepEqual(names(project.solution.root), ['Services', 'Web', 'Data', 'Platform', 'Delivery', 'Quality', 'Documentation', 'Project brief']);
  assert.match((await read<TextDocument>(project, child(project.solution.root, 'Project brief')))!.html, /^<h1>Across<\/h1>/);
});
