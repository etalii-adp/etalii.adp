/* The tests in a browser: node test/e2e/run.mjs [name]. They walk the built pages on every backend and compare the walks, and they show what the pages do with a storage that is in the browser, empty, slow, away, or behind a real WebSocket. */
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { startService } from './service.mjs';
import { compare, normalise, walk } from './walk.mjs';

const only = process.argv[2];
const site = await serve(resolve('dist')), browser = await chromium.launch();
let failed = 0, ran = 0;

const newContext = () => browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
/* a page that fails the test it is in when it throws or logs an error */
async function newPage(context, errors) {
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|WebSocket connection/.test(m.text())) errors.push('console error: ' + m.text()); });
  return page;
}
const ready = page => page.waitForFunction(() => document.documentElement.classList.contains('ready'));
const row = (page, name) => page.locator('#tree .row', { has: page.locator(`.nm:text-is("${name}")`) }).first();
const expand = async (page, name) => { const tw = row(page, name).locator('.tw'); if (!(await tw.evaluate(e => e.classList.contains('open')))) await tw.click(); };
const menuItem = (page, text) => page.locator('body > .menu > .mi', { has: page.locator(`:scope > span:text-is("${text}")`) }).first();
const typed = async (page, text) => { await page.waitForFunction(() => document.activeElement?.matches('input:not([type=checkbox]), textarea')); await page.keyboard.type(text); };
const rename = async (page, from, to) => { await row(page, from).click(); await page.keyboard.press('F2'); await typed(page, to); await page.keyboard.press('Enter'); };
const assert = (ok, what) => { if (!ok) throw new Error(what); };

async function test(name, run) {
  if (only && !name.includes(only)) return;
  ran++;
  const errors = [], context = await newContext(), started = Date.now();
  try {
    await run(context, errors);
    assert(!errors.length, errors.join('; '));
    console.log(`ok    ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${String(e.message).split('\n').slice(0, 6).join('\n      ')}`); }
  await context.close();
}

/* one walk, on a page of its own */
async function walked(context, backend) {
  const { trace, problems } = await walk(await context.newPage(), site.url, { backend });
  assert(!problems.length, `the walk on ${backend ?? 'memory'} has problems: ${problems.slice(0, 5).join('; ')}`);
  return normalise(trace);
}
const same = (a, b, name) => { const found = compare(a, b, 200); assert(!found.length, `${found.length} differences between the walk on memory and on ${name}:\n${found.slice(0, 3).join('\n')}`); };

let memory = null;
const reference = async context => memory ??= await walked(context);

await test('walk: every step works with the storage in memory', async context => { assert((await reference(context)).length > 180, 'the walk is shorter than it was'); });

await test('walk: the same with the storage kept in the browser, and it is kept from page to page', async (context, errors) => {
  same(await reference(await newContext()), await walked(context, 'browser'), 'browser');
  /* what the walk made is still there for a page that comes later */
  const page = await newPage(context, errors);
  await page.goto(site.url + 'ide/index.html?backend=browser'); await ready(page);
  await expand(page, 'Ingestion'); await expand(page, 'Pipelines');
  assert(await row(page, 'Billing export').count() === 1, 'a page that came later does not show what the walk added');
});

await test('walk: the same with every call crossing the wire inside the page', async context => { same(await reference(await newContext()), await walked(context, 'loopback'), 'loopback'); });

await test('walk: the same against a service behind a real WebSocket', async context => {
  const service = await startService();
  try {
    same(await reference(await newContext()), await walked(context, 'hosted&service=' + encodeURIComponent(service.url)), 'hosted');
    assert(service.connections >= 3, `only ${service.connections} pages reached the service: the choice of backend was not kept for the visit`);
    const state = [...service.world.opened()].map(id => service.world.project(id))[0];
    assert([...state.items.values()].some(x => x.name === 'Billing export'), 'what the walk added did not reach the service');
  } finally { await service.stop(); }
});

await test('start page: comes up without loading the storage', async (context, errors) => {
  const page = await newPage(context, errors), loaded = [];
  page.on('response', r => loaded.push(r.url().replace(site.url, '') + ' ' + r.status()));
  await page.goto(site.url); await ready(page);
  assert(loaded.every(l => l.endsWith(' 200')), 'something did not load: ' + loaded.filter(l => !l.endsWith(' 200')).join(', '));
  const scripts = loaded.filter(l => /\.js /.test(l));
  assert(scripts.length <= 4, 'the start page loads more scripts than its own: ' + scripts.join(', '));
});

await test('browser storage: a change and the window\'s own state are there after a reload', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'ide/index.html?backend=browser'); await ready(page);
  await expand(page, 'Ingestion'); await expand(page, 'Pipelines');
  await rename(page, 'Customer sync', 'Customer feed');
  await page.locator('[data-tw="problems"]').first().click();
  const tabs = await page.locator('#tabs .tab').count();
  /* the window's state is kept a moment after it changed */
  await page.waitForTimeout(600);
  await page.reload(); await ready(page);
  await row(page, 'Customer feed').waitFor();
  assert(await page.locator('#tree .row.sel .nm').textContent() === 'Customer feed', 'the selection was not kept over the reload');
  assert(await page.locator('#tabs .tab').count() === tabs, 'the open tabs were not kept over the reload');
  assert(await page.locator('#tree .row .nm:text-is("Customer feed")').evaluate(e => e.classList.contains('vM')), 'the renamed item no longer shows as changed');
  /* what Undo can take back ends with the page that made the changes */
  await page.locator('#menus [data-m="Edit"]').click();
  assert(await page.locator('body > .menu > .mi.dis', { hasText: 'Undo' }).count() === 1, 'Undo offers to take back a change of a page that is gone');
});

await test('browser storage: another tab shows a change without a reload, and keeps its own selection', async (context, errors) => {
  const one = await newPage(context, errors), two = await newPage(context, errors);
  for (const page of [one, two]) { await page.goto(site.url + 'ide/index.html?backend=browser'); await ready(page); await expand(page, 'Ingestion'); await expand(page, 'Pipelines'); }
  await rename(one, 'Customer sync', 'Customer feed');
  await row(two, 'Customer feed').waitFor();
  assert(await row(two, 'Customer sync').count() === 0, 'the other tab still shows the old name');
  /* and the other way round, with something that changes several stores at once */
  await row(two, 'Weather enrichment').click(); await two.locator('#tree').press('Delete');
  await row(one, 'Weather enrichment').waitFor({ state: 'detached' });
  await two.locator('.toast button').click();
  await row(one, 'Weather enrichment').waitFor();
  assert(await one.locator('#tree .row.sel .nm').textContent() === 'Customer feed', 'one tab took over the selection of the other');
  assert(await two.locator('#tree .row.sel .nm').textContent() === 'Weather enrichment', 'the other tab lost its own selection');
});

await test('empty storage: every page draws, and every kind of item opens in its tool with nothing written of it', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'login/index.html?backend=empty'); await ready(page);
  await page.fill('#lg-pw', 'anything'); await page.locator('#loginForm [type=submit]').click();
  await page.waitForURL(/projects/); await ready(page);
  assert(await page.locator('.pj-row').count() === 1, 'the overview of an empty storage shows other than its one project');
  await page.locator('.pj-row').first().click(); await page.waitForURL(/ide/); await ready(page);
  /* adds one item of every kind a level offers, level by level, and opens each */
  const seen = new Set(), levels = [await page.locator('#tree .row .nm').first().textContent()];
  while (levels.length) {
    const level = levels.shift();
    await row(page, level).click({ button: 'right' });
    /* an item that holds no items offers nothing new */
    const offers = await page.locator('body > .menu > .mi:not(.dis)', { has: page.locator(':scope > span:text-is("New")') }).count();
    if (offers) await menuItem(page, 'New').click();
    const kinds = offers ? await menuItem(page, 'New').locator('.menu > .mi > span:not(.lead)').allTextContents() : [];
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    for (const kind of kinds.filter(k => k && !seen.has(k))) {
      seen.add(kind);
      await row(page, level).click({ button: 'right' }); await menuItem(page, 'New').click();
      await menuItem(page, 'New').locator('.menu > .mi', { has: page.locator(`:scope > span:text-is("${kind}")`) }).first().click();
      const name = 'A ' + kind.toLowerCase();
      await typed(page, name); await page.keyboard.press('Enter');
      await row(page, name).waitFor();
      await page.locator('#doc > *').first().waitFor().catch(() => { throw new Error(`${kind} opens as an empty page`); });
      assert(await page.locator('#doc').evaluate(d => d.textContent.trim().length > 0), `${kind} opens without a word`);
      levels.push(name);
    }
  }
  assert(seen.size > 25, `only ${seen.size} kinds of item could be added: ${[...seen].join(', ')}`);
  for (const id of ['problems', 'commit']) await page.locator(`[data-tw="${id}"]`).first().click();
});

await test('slow storage: the page says that it waits, and shows the answer when it is there', async (context, errors) => {
  const page = await newPage(context, errors);
  page.setDefaultTimeout(15000);
  await page.goto(site.url + 'ide/index.html?backend=slow:700'); await ready(page);
  await expand(page, 'Ingestion'); await expand(page, 'Pipelines');
  await row(page, 'Customer sync').click(); await page.keyboard.press('F2'); await typed(page, 'Customer feed'); await page.keyboard.press('Enter');
  await page.locator('#status', { hasText: 'Waiting for the storage…' }).waitFor();
  await row(page, 'Customer feed').waitFor();
  await page.locator('#status', { hasText: 'Waiting for the storage…' }).waitFor({ state: 'detached' });
});

await test('storage that is away: every page says so and offers to try again', async (context, errors) => {
  const page = await newPage(context, errors);
  for (const at of ['login', 'projects', 'ide']) {
    await page.goto(site.url + at + '/index.html?backend=slow:offline'); await ready(page);
    await page.locator('.veil .dlg', { hasText: 'No connection to the storage' }).waitFor();
    assert(await page.locator('.veil .btn.pri').textContent() === 'Try Again', 'the notice offers nothing');
  }
});

await test('storage that takes no changes: a command is refused in words and nothing changes', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'ide/index.html?backend=slow:read-only'); await ready(page);
  await expand(page, 'Ingestion'); await expand(page, 'Pipelines');
  await row(page, 'Customer sync').click(); await page.locator('#tree').press('Delete');
  await page.locator('.toast', { hasText: 'The storage does not answer.' }).waitFor();
  assert(await row(page, 'Customer sync').count() === 1, 'the item is gone although the storage did not take the delete');
});

await test('hosted storage: no service at the address gives the notice, not an empty page', async (context, errors) => {
  const page = await newPage(context, errors);
  page.setDefaultTimeout(15000);
  await page.goto(site.url + 'ide/index.html?backend=hosted&service=' + encodeURIComponent('ws://127.0.0.1:9')); await ready(page);
  await page.locator('.veil .dlg', { hasText: 'No connection to the storage' }).waitFor();
});

await test('hosted storage: two pages hear of each other, and a page lives through the service going away and coming back', async (context, errors) => {
  const service = await startService(), at = site.url + 'ide/index.html?backend=hosted&service=' + encodeURIComponent(service.url);
  try {
    const one = await newPage(context, errors), two = await newPage(await newContext(), errors);
    for (const page of [one, two]) { page.setDefaultTimeout(15000); await page.goto(at); await ready(page); await expand(page, 'Ingestion'); await expand(page, 'Pipelines'); }
    await rename(one, 'Customer sync', 'Customer feed');
    await row(two, 'Customer feed').waitFor();
    await service.stop();
    await one.locator('#status', { hasText: /Connecting to the storage…|Storage offline/ }).waitFor();
    await one.locator('#status', { hasText: 'Storage offline' }).waitFor();
    await row(one, 'Weather enrichment').click(); await one.locator('#tree').press('Delete');
    await one.locator('.toast', { hasText: 'The storage does not answer.' }).waitFor();
    assert(await row(one, 'Weather enrichment').count() === 1, 'the item is gone although the service never heard of the delete');
    /* while this page was cut off, the service is back and somebody else changes something */
    await service.start();
    await two.locator('#status', { hasText: 'Storage offline' }).waitFor({ state: 'detached' });
    await rename(two, 'Customer feed', 'Customer intake');
    await one.locator('#status', { hasText: 'Storage offline' }).waitFor({ state: 'detached' });
    await row(one, 'Customer intake').waitFor();
    await rename(one, 'Weather enrichment', 'Weather join');
    await row(two, 'Weather join').waitFor();
  } finally { await service.stop(); }
});

await browser.close();
await site.close();
console.log(`${ran - failed} of ${ran} passed`);
process.exit(failed || !ran ? 1 : 0);
