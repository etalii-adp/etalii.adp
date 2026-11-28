/* The agent store: the conversations that are over, asking, the answer that arrives later, and what a conversation is kept apart from. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Refused, Storage, type Item, type ProjectStorage } from '../../src/storage';
import { empty } from '../../src/storage/backends/empty/seed';
import { example } from '../../src/storage/backends/_example';
import { InPage } from '../../src/storage/backends/common/in-page';
import { makeWorld } from '../../src/storage/backends/common/server';
import type { World } from '../../src/storage/backends/common/server/core';
import type { Seed } from '../../src/storage/backends/common/server/seed';

/* the agent answers at once in these tests, unless a test wants to catch it at work */
const quick = (seed: Seed, answerMs = 0): Seed => ({ ...seed, answerMs });

async function page(world: World = makeWorld(quick(example))): Promise<{ storage: Storage; project: ProjectStorage; told: () => number; changed: () => number; world: World }> {
  const storage = new Storage(new InPage('memory', world));
  let told = 0, changed = 0;
  storage.onForeign(() => { told++; });
  await Promise.all([storage.catalogue.load(), storage.identity.load(), storage.projects.load()]);
  const project = await storage.open(storage.projects.lastOpenedId);
  project.agent.onChange(() => { changed++; });
  return { storage, project, told: () => told, changed: () => changed, world };
}
const named = (project: ProjectStorage, name: string): Item => { for (const x of project.solution.all()) if (x.name === name) return x; throw new Error('No item is called ' + name); };
const refused = async (run: Promise<unknown>): Promise<Refused> => { try { await run; } catch (e) { if (e instanceof Refused) return e; throw e; } throw new Error('It was not refused.'); };
const later = (ms = 15): Promise<void> => new Promise(done => setTimeout(done, ms));
/* what was said in a conversation, once it has arrived */
async function said(project: ProjectStorage, id: string) { for (let i = 0; i < 20; i++) { const m = project.agent.messages(id); if (m) return m; await later(5); } throw new Error('The conversation did not arrive.'); }

test('the conversations that are over are listed newest first, and what was said arrives when it is asked for', async () => {
  const { project, changed } = await page(), list = project.agent.conversations;
  assert.ok(list.length >= 5);
  assert.equal(list[0].day, 'Today');
  assert.ok(list.every(c => c.title && c.time && c.last && c.messages >= 2 && !c.answering));
  assert.equal(project.agent.messages(list[1].id), undefined, 'what was said is not read before it is asked for');
  const before = changed(), messages = await said(project, list[1].id);
  assert.ok(changed() > before, 'the part that shows it is told when it is there');
  assert.equal(messages.length, list[1].messages);
  assert.ok(messages[0].mine && !messages[1].mine);
  assert.ok(messages[1].steps.length > 0 && messages[1].items.length > 0 && messages[1].items.every(x => project.solution.has(x)));
  assert.equal(project.agent.messages('no-such-conversation'), undefined);
});

test('a question starts a conversation, and the answer arrives later as a change the page as a whole is not told of', async () => {
  const world = makeWorld(quick(example, 30)), { project, told } = await page(world), other = await page(world), count = project.agent.conversations.length;
  const id = await project.agent.ask('  What is wrong in this project?  ');
  assert.equal(project.agent.conversations.length, count + 1);
  assert.equal(project.agent.conversations[0].id, id);
  assert.equal(project.agent.conversations[0].title, 'What is wrong in this project?');
  assert.ok(project.agent.conversations[0].answering);
  assert.deepEqual((await said(project, id)).map(m => m.mine), [true]);
  assert.equal((await refused(project.agent.ask('And now?', id))).code, 'busy');
  await later(60);
  const messages = await said(project, id), answer = messages[1];
  assert.equal(messages.length, 2);
  assert.ok(!project.agent.conversations[0].answering);
  assert.match(answer.text, /^Validation finds 2 errors, 3 warnings and 3 notes in /);
  assert.ok(answer.items.length > 0 && answer.steps.length === 2);
  /* another window of the same user has the conversation as well, and neither page was told to draw everything again */
  assert.equal(other.project.agent.conversations[0].id, id);
  assert.equal((await said(other.project, id)).length, 2);
  assert.ok(other.changed() >= 2);
  assert.equal(told() + other.told(), 0);
});

test('the agent answers from the project as it is', async () => {
  const { project } = await page(), ask = async (text: string, about?: Item, conversation = ''): Promise<string> => { const id = await project.agent.ask(text, conversation, about); await later(); return (await said(project, id)).at(-1)!.text; };
  const pipeline = named(project, 'Meter readings to Bronze'), ingestion = named(project, 'Ingestion');
  assert.match(await ask('Any problems here?', ingestion), /^Validation finds 1 problem under Ingestion:/);
  assert.match(await ask('What changed?'), /^7 items have changes that are not committed on develop, in 10 files/);
  assert.match(await ask('Who changed what lately?'), /^The last 5 commits on develop:/);
  assert.match(await ask('Where is the outage map?'), /^11 items have that in their names:\n• Outage map, web page in Pages/);
  assert.match(await ask('Where is the zeppelin?'), /^Nothing in .+ has "zeppelin" in its name\.$/);
  assert.match(await ask('Can we release?'), /The run button starts Deploy to staging\./);
  assert.match(await ask('Add something', ingestion), /^Ingestion takes 3 kinds of item: Group, Data pipeline, Data source\./);
  assert.match(await ask('Tell me about this', pipeline), /^Meter readings to Bronze is a data pipeline in .+ › Ingestion › Pipelines\. .*It has changes that are not committed\. Validation finds 1 problem on it/);
  assert.match(await ask('Hello'), /holds 130 items under Ingestion, /);
  /* once the item with the error is gone, so is what the agent says of it */
  await project.solution.remove(pipeline);
  assert.match(await ask('Any problems here?', ingestion), /^Validation finds 1 error, 3 warnings and 3 notes in /);
  /* a follow-up is said in the same conversation */
  const id = await project.agent.ask('What changed?');
  await later();
  assert.equal(await project.agent.ask('And who did it?', id), id);
  await later();
  assert.deepEqual((await said(project, id)).map(m => m.mine), [true, false, true, false]);
  assert.equal(project.agent.conversation(id)!.messages, 4);
});

test('an empty project is answered as well, and an empty question is refused', async () => {
  const { project } = await page(makeWorld(quick(empty)));
  assert.equal(project.agent.conversations.length, 0);
  assert.equal((await refused(project.agent.ask('   '))).code, 'empty');
  const id = await project.agent.ask('What is wrong?');
  await later();
  assert.match((await said(project, id))[1].text, /^Validation finds no problems in /);
  const about = await project.agent.ask('What is here?');
  await later();
  assert.match((await said(project, about))[1].text, /holds 0 items\./);
});

test('a conversation is renamed and deleted, and is told to the other window', async () => {
  const world = makeWorld(quick(example)), { project } = await page(world), other = await page(world), first = project.agent.conversations[0], count = project.agent.conversations.length;
  await project.agent.rename(first.id, '  The pipeline and the model  ');
  assert.equal(project.agent.conversation(first.id)!.title, 'The pipeline and the model');
  assert.equal(other.project.agent.conversation(first.id)!.title, 'The pipeline and the model');
  assert.equal((await refused(project.agent.rename(first.id, ' '))).code, 'empty');
  await said(other.project, first.id);
  const done = await project.agent.remove(first.id);
  assert.match(done.message, /^Deleted the conversation "The pipeline and the model"$/);
  assert.equal(project.agent.conversations.length, count - 1);
  assert.equal(other.project.agent.conversation(first.id), undefined);
  assert.equal(other.project.agent.messages(first.id), undefined);
  assert.equal((await refused(project.agent.ask('Still there?', first.id))).code, 'gone');
});

test('taking a change back leaves the conversations as they are', async () => {
  const { project } = await page(), item = named(project, 'Home'), count = project.agent.conversations.length;
  await project.solution.rename(item, 'Start');
  const id = await project.agent.ask('Tell me about this', '', item);
  await later();
  await project.history.undo();
  assert.equal(item.name, 'Home');
  /* read again, so it is what the backend holds and not what this page remembers */
  await project.agent.load();
  assert.equal(project.agent.conversations.length, count + 1);
  assert.match((await said(project, id))[1].text, /^Start is a web page/);
  await project.history.redo();
  await project.agent.load();
  assert.equal(project.agent.conversations.length, count + 1);
});

test('conversations are kept with the project, and a question that was kept without its answer is answered', async () => {
  const world = makeWorld(quick(example, 10_000)), { project } = await page(world);
  const id = await project.agent.ask('What changed?');
  /* the page is left before the agent is done: what is kept has the question and no answer */
  const kept = world.keep(project.info.id), again = await page(makeWorld(quick(example), [[project.info.id, kept]]));
  const found = again.project.agent.conversation(id);
  assert.ok(found && !found.answering && found.messages === 2);
  assert.match((await said(again.project, id))[1].text, /^7 items have changes/);
});
