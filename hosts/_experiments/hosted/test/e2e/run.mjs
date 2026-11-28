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

await test('slow storage: a document that arrives leaves a name that is being typed in the Properties alone', async (context, errors) => {
  const page = await newPage(context, errors);
  page.setDefaultTimeout(15000);
  await page.goto(site.url + 'ide/index.html?backend=slow:900'); await ready(page);
  await expand(page, 'Ingestion'); await expand(page, 'Pipelines');
  const field = () => page.evaluate(() => ({ there: window.field.isConnected, focused: document.activeElement === window.field, value: window.field.value }));
  /* what the tool shows changes when the item's document is there */
  const arrives = async () => { const was = await page.evaluate(() => { window.field = document.querySelector('#p-name'); return document.querySelector('#doc').innerHTML; }); await page.waitForFunction(html => document.querySelector('#doc').innerHTML !== html, was); };

  /* the document is asked for when the item opens, and the name is typed before it is there */
  await row(page, 'Customer sync').click();
  await page.fill('#p-name', 'Customer feed');
  await arrives();
  const typing = await field();
  assert(typing.there && typing.focused && typing.value === 'Customer feed', `the field was taken away while it was typed in: ${JSON.stringify(typing)}`);
  assert(await row(page, 'Customer feed').count() === 0 && await row(page, 'Customer sync').count() === 1, 'the name was taken before it was entered');
  await page.keyboard.press('Tab');
  await row(page, 'Customer feed').waitFor();

  /* a field somebody is in without typing stays as well, and the Properties are drawn when it is left */
  await row(page, 'Meter readings to Bronze').click();
  await page.locator('#p-name').focus();
  await arrives();
  const resting = await field();
  assert(resting.there && resting.focused, `the field was taken away while somebody was in it: ${JSON.stringify(resting)}`);
  await page.evaluate(() => document.activeElement.blur());
  assert(!(await field()).there, 'what arrived is not shown in the Properties when the field is left');
  assert(await row(page, 'Meter readings to Bronze').count() === 1, 'leaving the field changed the name');
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

/* the answers of the agent that a page shows, and waiting for one more */
const answers = page => page.locator('.ag-msg:not(.mine):not(.ag-wait)');
const answered = (page, count) => page.waitForFunction(n => document.querySelectorAll('.ag-msg:not(.mine):not(.ag-wait)').length === n, count);

await test('agent: conversations that are over open, a question is answered from the project, and it is all there after a reload', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'ide/index.html?backend=browser'); await ready(page);
  await page.locator('[data-tw="agent"]').click();
  assert(await page.locator('.ag-hello .ag-start').count() === 4, 'a new conversation does not offer something to start with');
  /* the conversations that are over, by day, and searched */
  await page.locator('#ag-all').click();
  const before = await page.locator('.ag-row').count();
  assert(before >= 5 && await page.locator('.ag-day').count() >= 4, 'the conversations that are over are not listed by day');
  await page.locator('#ag-q').fill('linked repositories');
  assert(await page.locator('.ag-row').count() === 1, 'the search does not narrow the conversations down');
  await page.locator('#ag-q').fill('nothing is called this');
  assert(await page.locator('.ag-rows .hint').count() === 1, 'a search that finds nothing does not say so');
  await page.locator('#ag-q').fill('');
  /* one of them opens with everything that was said, and an item it names opens in the document area */
  await page.locator('.ag-row .ag-open').nth(1).click();
  await page.locator('.ag-msg .ag-text').first().waitFor();
  assert(await page.locator('.ag-msg').count() === 4 && await page.locator('.ag-msg.mine').count() === 2 && await page.locator('.ag-steps li').count() >= 3, 'an earlier conversation does not show what was said');
  await page.locator('.ag-item', { hasText: 'Release readiness' }).first().click();
  assert(await page.locator('.tab.on', { hasText: 'Release readiness' }).count() === 1, 'an item a message names does not open');
  /* a new conversation is about the selected item, unless that is switched off */
  await page.locator('#ag-new').click();
  await row(page, 'Ingestion').click();
  assert((await page.locator('.ag-on').innerText()).trim() === 'About Ingestion', 'the question is not asked of the selected item');
  assert(await page.locator('#ag-send').isDisabled(), 'nothing can be sent before anything was typed');
  await page.locator('.ag-ask textarea').fill('Any problems');
  await page.keyboard.press('Shift+Enter');
  assert(await answers(page).count() === 0 && (await page.locator('.ag-ask textarea').inputValue()).includes('\n'), 'Shift with Enter sent the question');
  await page.keyboard.type('here?');
  await page.keyboard.press('Enter');
  await answered(page, 1);
  assert(/^Validation finds 1 problem under Ingestion:/.test(await answers(page).first().locator('.ag-text').innerText()), 'the agent does not answer from the project');
  assert(await page.locator('.ag-ask textarea').inputValue() === '' && (await page.locator('#ag-title').innerText()).startsWith('Any problems'), 'the conversation did not take the question as its title');
  await page.locator('.ag-on').click();
  await page.locator('.ag-ask textarea').fill('What changed?');
  await page.keyboard.press('Enter');
  await answered(page, 2);
  assert(/^7 items have changes that are not committed/.test(await answers(page).nth(1).locator('.ag-text').innerText()), 'a follow-up is not answered');
  /* the conversation, and that the window shows it, are kept */
  await page.waitForTimeout(500);
  await page.reload(); await ready(page);
  await answered(page, 2);
  assert((await page.locator('#ag-title').innerText()).startsWith('Any problems') && await page.locator('.ag-msg').count() === 4, 'the conversation is not there after a reload');
  /* it is the first of the list, and can be renamed and deleted */
  await page.locator('#ag-all').click();
  assert(await page.locator('.ag-row').count() === before + 1 && await page.locator('.ag-row').first().evaluate(r => r.classList.contains('on')), 'the new conversation is not the first of the list');
  await page.locator('.ag-row').first().hover();
  await page.locator('.ag-row').first().locator('[data-cm]').click();
  await menuItem(page, 'Rename…').click();
  await page.locator('.dlg input').fill('Ingestion and what changed');
  await page.keyboard.press('Enter');
  await page.locator('.ag-row b', { hasText: 'Ingestion and what changed' }).waitFor();
  await page.locator('.ag-row').first().click({ button: 'right' });
  await menuItem(page, 'Delete').click();
  await page.locator('.toast', { hasText: 'Deleted the conversation "Ingestion and what changed"' }).waitFor();
  assert(await page.locator('.ag-row').count() === before, 'a deleted conversation is still listed');
  await page.locator('#ag-all').click();
  assert(await page.locator('.ag-hello').count() === 1, 'the window still shows the conversation that was deleted');
});

await test('agent: an empty project is answered as well, and a slow storage shows the question while it is on its way', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'ide/index.html?backend=empty'); await ready(page);
  await page.locator('[data-tw="agent"]').click();
  await page.locator('#ag-all').click();
  assert(await page.locator('.ag-rows .hint').count() === 1, 'an empty list of conversations does not say so');
  await page.locator('#ag-all').click();
  await page.locator('.ag-start').first().click();
  await answered(page, 1);
  assert(/^Validation finds no problems in /.test(await answers(page).first().locator('.ag-text').innerText()), 'the agent does not answer on an empty project');
  const slow = await newPage(context, errors);
  await slow.goto(site.url + 'ide/index.html?backend=slow:600'); await ready(slow);
  await slow.locator('[data-tw="agent"]').click();
  await slow.locator('.ag-ask textarea').fill('Who changed what lately?');
  await slow.keyboard.press('Enter');
  await slow.locator('.ag-msg.mine .ag-text', { hasText: 'Who changed what lately?' }).waitFor({ timeout: 400 });
  assert(await slow.locator('.ag-dots').count() === 1, 'nothing shows that the agent is asked');
  await answered(slow, 1);
  assert(await slow.locator('.ag-msg.mine').count() === 1 && await slow.locator('.ag-dots').count() === 0, 'the question shows twice, or the agent still seems to answer');
  /* a storage that takes no changes refuses the question in words, and the question is still in the field */
  const closed = await newPage(context, errors);
  await closed.goto(site.url + 'ide/index.html?backend=slow:read-only'); await ready(closed);
  await closed.locator('[data-tw="agent"]').click();
  await closed.locator('.ag-ask textarea').fill('What changed?');
  await closed.keyboard.press('Enter');
  await closed.locator('.toast', { hasText: 'The storage does not answer.' }).waitFor();
  assert(await closed.locator('.ag-ask textarea').inputValue() === 'What changed?' && await closed.locator('.ag-hello').count() === 1, 'a question that was refused is lost');
});

/* the New Project wizard: opening it, going on, and the lines of a hierarchy as "depth name" */
const wizard = async page => { await page.locator('#pj-new').click(); await page.locator('.wz').waitFor(); };
const next = page => page.locator('.wz [data-next]').click();
const stepAt = page => page.locator('.wz-step.on').evaluate(b => b.lastChild.textContent);
const lines = (page, rows) => page.locator(rows).evaluateAll(list => list.map(r => `${r.style.getPropertyValue('--d')} ${(r.querySelector('.nm') ?? r.querySelector('span')).textContent.trim()}`));
const chosen = page => page.locator('.wz-opt.on').evaluateAll(list => list.map(o => o.dataset.opt));

await test('wizard: a web application is asked what it is built with, and the hierarchy the wizard shows is the one the IDE opens with', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'projects/index.html'); await ready(page);
  const before = await page.locator('.pj-row').count();
  await wizard(page);
  /* nothing goes on before it is said what is being built */
  assert(await page.locator('.wz-size').count() === 6 && await page.locator('.wz-size.on').count() === 0, 'the wizard does not offer its six kinds of solution, or chose one itself');
  assert(await page.locator('.wz [data-next]').isDisabled() && await page.locator('.wz-step:disabled').count() === 4, 'the wizard goes on without a kind of solution');
  assert((await page.locator('.wz-size b').allInnerTexts()).join() === 'Console application,Web application,Mobile app,Backend service,Distributed system,Platform solution', 'the kinds of solution are not listed from small to large');
  await page.locator('[data-size="web"]').click();
  assert(await page.locator('[data-size="web"]').getAttribute('aria-checked') === 'true' && await page.locator('[data-size="web"]').evaluate(e => e === document.activeElement), 'the chosen kind is not marked, or lost the focus');
  await page.keyboard.press('Enter');
  /* a web application is asked about the web, not about mobile or messaging, and starts from what is usual */
  assert(await stepAt(page) === 'Technology', 'Enter does not go on');
  assert((await page.locator('.wz-q legend b').allInnerTexts()).join() === 'Languages and runtimes,Web front end,Data,Hosting,AI', 'a web application is asked other questions than its own');
  assert((await chosen(page)).join() === 'typescript,react,postgres,paas', 'the usual choices of a web application are not made');
  await page.locator('[data-opt="redis"]').click();
  await page.locator('[data-opt="react"]').click(); await page.locator('[data-opt="vue"]').click();
  assert(await page.locator('[data-opt="vue"]').evaluate(e => e === document.activeElement), 'a choice loses the focus when it is made');
  await next(page);
  assert(await stepAt(page) === 'Delivery and quality' && (await chosen(page)).join() === 'tests,cicd,docs', 'the step on delivery does not start from what is usual');
  await page.locator('[data-opt="cicd"]').click();
  await next(page);
  /* the recipes follow from the answers */
  const offered = await page.locator('.wz-rec b').allInnerTexts();
  for (const name of ['TypeScript service with an API', 'Vue web client', 'PostgreSQL database', 'Redis cache', 'Managed Redis', 'Identity provider', 'Automated tests', 'End-to-end tests', 'Documentation'])
    assert(offered.includes(name), `the recipe ${name} is not offered: ${offered.join(', ')}`);
  for (const name of ['React web client', 'Release pipeline', 'Apache Kafka messaging', 'C# service with an API'])
    assert(!offered.includes(name), `the recipe ${name} is offered although nothing asks for it`);
  assert(await page.locator('.wz-rec.on').count() === offered.length, 'a recipe that is offered is not kept from the start');
  const full = await lines(page, '.wz-tree .wz-row');
  assert(full[0] === '0 New project' && full.at(-1) === '1 Project brief' && full.includes('1 Web') && full.includes('2 Vue client'), `the hierarchy does not show what the recipes make: ${full.slice(0, 8).join(' | ')}`);
  /* the tests of both recipes are in one group */
  assert(full.filter(l => l === '2 Tests').length === 1, 'a group two recipes share is shown twice');
  /* a recipe that is put aside leaves the hierarchy, and the count */
  const note = await page.locator('.wz-note').innerText();
  await page.locator('.wz-rec', { hasText: 'Identity provider' }).click();
  const without = await lines(page, '.wz-tree .wz-row');
  assert(without.length === full.length - 1 && !without.includes('2 Identity provider'), 'a recipe that is put aside is still in the hierarchy');
  assert(await page.locator('.wz-note').innerText() !== note && /^Web application · \d+ items from \d+ recipes$/.test(note), 'the count does not follow the recipes');
  await page.locator('.wz [data-all=""]').click();
  assert((await lines(page, '.wz-tree .wz-row')).join() === '0 New project,1 Project brief' && (await page.locator('.wz-all span').innerText()).startsWith('0 recipes of'), 'Select none keeps something');
  await page.locator('.wz [data-all="1"]').click();
  assert((await lines(page, '.wz-tree .wz-row')).join() === full.join(), 'Select all does not bring everything back');
  await page.locator('.wz-rec', { hasText: 'Identity provider' }).click();
  /* going back keeps the answers, and what was put aside */
  await page.locator('.wz [data-back]').click(); await page.locator('.wz [data-back]').click();
  assert(await stepAt(page) === 'Technology' && (await chosen(page)).join() === 'typescript,vue,postgres,redis,paas', 'going back loses the answers');
  await page.locator('.wz-step', { hasText: 'Recipes' }).click();
  assert((await lines(page, '.wz-tree .wz-row')).join() === without.join(), 'going back and forth loses what was put aside');
  await next(page);
  /* a project needs a name that is not taken; the storage says so, under the name */
  assert(await stepAt(page) === 'Name and location' && await page.locator('#wz-name').evaluate(e => e === document.activeElement), 'the last step does not ask for the name');
  assert(await page.locator('.wz [data-next]').innerText() === 'Create Project', 'the last step does not offer to create the project');
  await page.keyboard.press('Enter');
  assert(await page.locator('#wz-err').innerText() === 'A project needs a name.', 'a project without a name is not refused');
  await page.locator('#wz-name').fill('atlas platform'); await page.keyboard.press('Enter');
  await page.locator('#wz-err', { hasText: 'There is already a project called "atlas platform".' }).waitFor();
  assert(await page.locator('.wz').count() === 1 && await page.locator('#wz-name').inputValue() === 'atlas platform', 'a refusal closes the wizard or loses the name');
  await page.locator('#wz-name').fill('Harbour Logistics');
  assert(await page.locator('#wz-err').isHidden() && await page.locator('#wz-path').getAttribute('placeholder') === '~/git/harbour-logistics', 'the name does not clear the refusal, or does not give the folder');
  const summary = await page.locator('.wz-sum h4').innerText();
  assert((await page.locator('.wz-ans').allInnerTexts()).some(t => /Web front end\s+Vue/.test(t)), 'the last step does not say what was chosen');
  /* the hierarchy carries the name now */
  await page.locator('.wz-step', { hasText: 'Recipes' }).click();
  const shown = await lines(page, '.wz-tree .wz-row');
  assert(shown[0] === '0 Harbour Logistics' && shown.slice(1).join() === without.slice(1).join(), 'the hierarchy does not carry the name of the project');
  await page.locator('.wz-step', { hasText: 'Name and location' }).click();
  assert(await page.locator('#wz-name').inputValue() === 'Harbour Logistics', 'the name is lost by looking at the recipes again');
  await page.keyboard.press('Enter');
  /* the IDE opens on the project, with the hierarchy the wizard showed and the brief of what it was told */
  await page.waitForURL(/ide/); await ready(page);
  for (;;) { const closed = page.locator('#tree .row .tw:not(.open):has(svg)'); if (!(await closed.count())) break; await closed.first().click(); }
  const tree = await lines(page, '#tree .row');
  assert(tree.join('\n') === shown.join('\n'), `the Explorer shows another hierarchy than the wizard did, from line ${tree.findIndex((l, i) => l !== shown[i])}: ${tree.find((l, i) => l !== shown[i])} where the wizard showed ${shown[tree.findIndex((l, i) => l !== shown[i])]} (${tree.length} lines and ${shown.length})`);
  assert((await page.locator('.tab').allInnerTexts()).map(t => t.trim()).join() === 'Harbour Logistics,Project brief', 'the project does not open with its brief beside it');
  await page.locator('.tab', { hasText: 'Project brief' }).click();
  await page.locator('#doc', { hasText: 'Harbour Logistics was started as a web application.' }).waitFor();
  assert(/Web front end: Vue/.test(await page.locator('#doc').innerText()) && /Vue web client, in Web\./.test(await page.locator('#doc').innerText()), 'the brief does not say what the wizard was told');
  assert(await page.locator('#tree .row .dot').count() === 0, 'a project that was just made has problems');
  /* it is composed further as any project: the area takes another client */
  await row(page, 'Web').click({ button: 'right' }); await menuItem(page, 'New').click();
  await menuItem(page, 'New').locator('.menu > .mi', { has: page.locator(':scope > span:text-is("Web application")') }).first().click();
  await typed(page, 'Partner portal'); await page.keyboard.press('Enter');
  await row(page, 'Partner portal').waitFor();
  /* the overview lists it first, with what the wizard counted, and it opens again */
  await page.goto(site.url + 'projects/index.html'); await ready(page);
  assert(await page.locator('.pj-row').count() === before + 1, 'the overview does not list the new project');
  const first = page.locator('.pj-row').first();
  assert(await first.locator('b').innerText() === 'Harbour Logistics' && await first.locator('small').first().innerText() === summary && await first.locator('small.mono').innerText() === '~/git/harbour-logistics', `the overview says something else of the project than the wizard did: ${await first.innerText()}`);
  await page.locator('#pj-q').fill('harbour');
  assert(await page.locator('.pj-row').count() === 1, 'the search does not find the new project');
  await first.click(); await page.waitForURL(/ide/); await ready(page);
  await row(page, 'Vue client').waitFor();
  assert(await page.locator('#tree .row .nm').first().innerText() === 'Harbour Logistics', 'the project does not open again');
  /* a second project by the same name is refused, and Cancel and Escape leave the overview as it was */
  await page.goto(site.url + 'projects/index.html'); await ready(page);
  await wizard(page);
  await page.locator('[data-size="console"]').dblclick();
  assert(await stepAt(page) === 'Technology' && (await page.locator('.wz-q legend b').allInnerTexts()).join() === 'Languages and runtimes,AI', 'a second click on a kind does not go on with it');
  await page.locator('.wz-step', { hasText: 'Name and location' }).click().catch(() => undefined);
  assert(await stepAt(page) === 'Technology', 'a step that was not reached yet can be opened');
  await next(page); await next(page); await next(page);
  await page.locator('#wz-name').fill('Harbour Logistics'); await page.keyboard.press('Enter');
  await page.locator('#wz-err', { hasText: 'There is already a project called "Harbour Logistics".' }).waitFor();
  await page.locator('.wz [data-x]').click();
  assert(await page.locator('.veil').count() === 0, 'Cancel does not close the wizard');
  await wizard(page);
  assert(await page.locator('.wz-size.on').count() === 0, 'a wizard that was cancelled is opened with its old answers');
  await page.keyboard.press('Escape');
  assert(await page.locator('.veil').count() === 0 && await page.locator('.pj-row').count() === before + 1, 'Escape does not close the wizard, or something was made');
});

await test('wizard: every kind of solution makes a project that opens, from a console application to a platform, on a narrow window as well', async (context, errors) => {
  const page = await newPage(context, errors);
  await page.goto(site.url + 'projects/index.html?backend=empty'); await ready(page);
  const counts = [];
  for (const [i, size] of ['console', 'web', 'mobile', 'service', 'distributed', 'platform'].entries()) {
    /* the last one on a window as narrow as a phone */
    if (size === 'platform') await page.setViewportSize({ width: 400, height: 780 });
    await wizard(page);
    await page.locator(`[data-size="${size}"]`).click();
    await next(page); await next(page); await next(page);
    const shown = await lines(page, '.wz-tree .wz-row'), recipes = await page.locator('.wz-rec.on').count();
    assert(recipes >= 3 && shown.length > recipes, `${size} starts from too little: ${recipes} recipes and ${shown.length} lines`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('.wz, .wz-body')].every(e => e.scrollWidth <= e.clientWidth + 1)), `the wizard of ${size} is wider than the window`);
    counts.push(shown.length);
    await next(page);
    await page.locator('#wz-name').fill('Solution ' + (i + 1)); await page.keyboard.press('Enter');
    await page.waitForURL(/ide/); await ready(page);
    assert(await page.locator('#tree .row .nm').first().innerText() === 'Solution ' + (i + 1), `the project of ${size} does not open`);
    const areas = shown.filter(l => l.startsWith('1 ')).map(l => l.slice(2));
    if (size !== 'platform') assert((await lines(page, '#tree .row')).filter(l => l.startsWith('1 ')).map(l => l.slice(2)).join() === areas.join(), `the project of ${size} opens with other areas than the wizard showed`);
    await page.goto(site.url + 'projects/index.html'); await ready(page);
    assert(await page.locator('.pj-row').count() === i + 2, `the overview lost a project after ${size}`);
  }
  assert(counts[0] < counts[1] && counts[1] < counts[4] && counts[4] < counts[5], `a larger solution does not start with more: ${counts.join(', ')}`);
});

await test('wizard: with the storage in the browser another tab lists the project at once, and it is kept with what was done in it', async (context, errors) => {
  const one = await newPage(context, errors), two = await newPage(context, errors);
  for (const page of [one, two]) { await page.goto(site.url + 'projects/index.html?backend=browser'); await ready(page); }
  const before = await two.locator('.pj-row').count();
  await wizard(one);
  await one.locator('[data-size="service"]').click();
  await next(one); await next(one); await next(one); await next(one);
  await one.locator('#wz-name').fill('Tide Tables'); await one.locator('#wz-path').fill('~/work/tides'); await one.locator('#wz-branch').fill('trunk');
  await one.keyboard.press('Enter');
  await one.waitForURL(/ide/); await ready(one);
  /* the other tab did nothing, and lists it */
  await two.locator('.pj-row b', { hasText: 'Tide Tables' }).waitFor();
  assert(await two.locator('.pj-row').count() === before + 1 && await two.locator('.pj-row').first().locator('small.mono').innerText() === '~/work/tides', 'the other tab does not list the project as it was made');
  assert((await two.locator('.pj-row').first().locator('.chip').last().innerText()).trim() === 'trunk', 'the project is not on the branch it was given');
  /* what is done in it is kept, as in any project */
  await rename(one, 'C# service', 'Tide service');
  await row(one, 'Tide service').waitFor();
  await one.waitForTimeout(300);
  await one.reload(); await ready(one);
  await row(one, 'Tide service').waitFor();
  assert(await one.locator('#tree .row .nm').first().innerText() === 'Tide Tables', 'a reload opens another project');
  await two.locator('.pj-row').first().click(); await two.waitForURL(/ide/); await ready(two);
  await row(two, 'Tide service').waitFor();
  /* a page that comes later lists it still, and its name stays taken */
  const later = await newPage(context, errors);
  await later.goto(site.url + 'projects/index.html?backend=browser'); await ready(later);
  assert(await later.locator('.pj-row').first().locator('b').innerText() === 'Tide Tables' && await later.locator('.pj-row').count() === before + 1, 'a page that comes later does not list the project');
  await wizard(later);
  await later.locator('[data-size="console"]').click();
  await next(later); await next(later); await next(later); await next(later);
  await later.locator('#wz-name').fill('tide tables'); await later.keyboard.press('Enter');
  await later.locator('#wz-err', { hasText: 'There is already a project called "tide tables".' }).waitFor();
});

await test('wizard: a slow storage shows that the project is being made, and one that takes no changes refuses it in words', async (context, errors) => {
  const slow = await newPage(context, errors);
  slow.setDefaultTimeout(15000);
  await slow.goto(site.url + 'projects/index.html?backend=slow:600'); await ready(slow);
  await slow.locator('#pj-new').click();
  assert(await slow.locator('#pj-new').isDisabled() && await slow.locator('.wz').count() === 0, 'the button can be pressed again while the wizard is on its way');
  await slow.locator('.wz').waitFor();
  assert(await slow.locator('.wz').count() === 1 && await slow.locator('#pj-new').isEnabled(), 'the wizard opened twice, or the button stays off');
  await slow.locator('[data-size="console"]').click();
  await next(slow); await next(slow); await next(slow); await next(slow);
  await slow.locator('#wz-name').fill('Slow Boat'); await slow.keyboard.press('Enter');
  await slow.locator('.wz [data-next]', { hasText: 'Creating…' }).waitFor({ timeout: 400 });
  assert(await slow.locator('.wz [data-next]').isDisabled(), 'the project can be created twice');
  await slow.locator('.wz [data-back]').click({ force: true });
  assert(await stepAt(slow) === 'Name and location', 'the wizard goes back while the project is being made');
  await slow.waitForURL(/ide/); await ready(slow);
  assert(await slow.locator('#tree .row .nm').first().innerText() === 'Slow Boat', 'the project does not open after the wait');
  const closed = await newPage(context, errors);
  closed.setDefaultTimeout(15000);
  await closed.goto(site.url + 'projects/index.html?backend=slow:read-only'); await ready(closed);
  await closed.locator('.pj-row').first().waitFor();
  const before = await closed.locator('.pj-row').count();
  await wizard(closed);
  await closed.locator('[data-size="web"]').click();
  await next(closed); await next(closed); await next(closed); await next(closed);
  await closed.locator('#wz-name').fill('Closed Door'); await closed.keyboard.press('Enter');
  await closed.locator('#wz-err', { hasText: 'The storage does not answer.' }).waitFor();
  assert(await closed.locator('.wz [data-next]').innerText() === 'Create Project' && await closed.locator('.wz [data-next]').isEnabled() && await closed.locator('#wz-name').inputValue() === 'Closed Door', 'a refusal leaves the wizard without a way on');
  await closed.locator('.wz [data-x]').click();
  assert(await closed.locator('.pj-row').count() === before, 'a project that was refused is listed');
});

await browser.close();
await site.close();
console.log(`${ran - failed} of ${ran} passed`);
process.exit(failed || !ran ? 1 : 0);
