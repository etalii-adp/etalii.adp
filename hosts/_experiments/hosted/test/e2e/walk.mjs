/* The walk: one visit through the login page, the projects and the IDE, as a list of steps. After each step the page is read as text, so two builds, or two backends, can be compared step by step. */

/* what a page shows, region by region */
const read = () => {
  const q = s => document.querySelector(s), html = e => e ? e.outerHTML : null, name = document.documentElement.dataset.page;
  const controls = [...document.querySelectorAll('input,select,textarea')].map(e => `${e.id || e.getAttribute('aria-label') || e.className}=${e.type === 'checkbox' ? e.checked : e.value}`);
  const popups = [...document.querySelectorAll('body > .menu, body > .toast, body > .veil')].map(e => e.outerHTML);
  const a = document.activeElement, focus = a && a !== document.body ? `${a.tagName.toLowerCase()}#${a.id}.${a.className}` : '';
  const root = { theme: document.documentElement.dataset.theme ?? '', style: document.documentElement.getAttribute('style') ?? '' };
  if (name !== 'ide') return { page: name, title: document.title, app: html(q('#app')), controls, popups, focus, root };
  const panels = Object.fromEntries([...document.querySelectorAll('[data-panel]')].map(p => [p.dataset.panel, { dock: p.parentElement?.id, hidden: p.hidden, html: p.hidden ? null : p.outerHTML }]));
  return { page: name, title: document.title, titlebar: html(q('.titlebar')), stripes: html(q('#stripe-l')) + html(q('#stripe-r')), tabs: html(q('#tabs')), dm: html(q('#dm')), crumbs: html(q('#crumbs')), doc: html(q('#doc')), panels, status: html(q('#status')), docks: ['left', 'right', 'bottom'].map(d => q('#dock-' + d).hidden), controls, popups, focus, root };
};

export async function walk(page, base, { backend } = {}) {
  const trace = [], problems = [];
  page.setDefaultTimeout(3000);
  page.on('pageerror', e => problems.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push('console error: ' + m.text()); });
  await page.route(u => !u.href.startsWith(base), r => r.abort());

  /* a step is over when the page has drawn and nothing in it has changed for a moment: an answer of the storage may come a little later than the click that asked for it */
  const settle = () => page.evaluate(() => new Promise(done => {
    let timer;
    const quiet = () => { clearTimeout(timer); timer = setTimeout(() => { watch.disconnect(); done(); }, 40); };
    const watch = new MutationObserver(quiet);
    watch.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(quiet)), 0);
  }));
  /* types into the field that has the focus, once there is one: a field for a name comes up when the storage has answered */
  const typed = async text => { await page.waitForFunction(() => document.activeElement?.matches('input:not([type=checkbox]), textarea')); await page.keyboard.type(text); };
  const step = async (label, fn) => {
    try { await fn(); await settle(); trace.push({ label, ...(await page.evaluate(read)) }); }
    catch (e) { problems.push(`step "${label}" failed: ${e.message.split('\n')[0]}`); trace.push({ label, failed: true }); if (process.env.WALK_VERBOSE) console.log('FAILED ' + label); }
  };
  const row = name => page.locator('#tree .row', { has: page.locator(`.nm:text-is("${name}")`) }).first();
  const open = name => row(name).click();
  /* opens the rows on the way to an item, by their twisties, and then the item itself */
  const expand = async name => { const tw = row(name).locator('.tw'); if (!(await tw.evaluate(e => e.classList.contains('open')))) await tw.click(); };
  const reach = async (...path) => { for (const name of path.slice(0, -1)) await expand(name); await open(path.at(-1)); };
  const item = text => page.locator('body > .menu > .mi', { has: page.locator(`:scope > span:text-is("${text}")`) }).first();
  const sub = (first, text) => item(first).locator('.menu > .mi', { has: page.locator(`:scope > span:text-is("${text}")`) }).first();
  const context = async (name, ...path) => { await row(name).click({ button: 'right' }); if (path.length === 1) await item(path[0]).click(); if (path.length === 2) { await item(path[0]).click(); await sub(path[0], path[1]).click(); } };
  const top = async (menu, text) => { await page.locator(`#menus [data-m="${menu}"]`).click(); if (text) await item(text).click(); };
  const stripe = id => page.locator(`[data-tw="${id}"]`).first().click();
  const panel = id => page.locator(`[data-panel="${id}"]`);
  const visit = async (label, path) => step(label, async () => { await page.goto(base + path + (backend ? (path.includes('?') ? '&' : '?') + 'backend=' + backend : '')); await page.waitForFunction(() => document.documentElement.classList.contains('ready')); });

  /* the start page only has to come up: its cloud of points never stands still */
  await page.goto(base + 'index.html' + (backend ? '?backend=' + backend : ''));
  await page.waitForFunction(() => document.documentElement.classList.contains('ready'));

  /* login */
  await visit('login', 'login/index.html');
  await step('login: no password', () => page.locator('#loginForm [type=submit]').click());
  await step('login: wrong password', async () => { await page.fill('#lg-pw', 'wrong'); await page.locator('#loginForm [type=submit]').click(); });
  await step('login: single sign-on', () => page.locator('[data-step="ssoForm"]').click());
  await step('login: single sign-on asks', () => page.locator('#ssoForm [type=submit]').click());
  await step('login: single sign-on answers', () => page.waitForTimeout(1100));
  await step('login: back', () => page.locator('#ssoForm [data-step="loginForm"]').click());
  await step('login: git provider', () => page.locator('[data-step="gitStep"]').click());
  await step('login: git provider asks', () => page.locator('[data-provider="GitLab"]').click());
  await step('login: git provider answers', () => page.waitForTimeout(1100));
  await step('login: back again', () => page.locator('#gitStep [data-step="loginForm"]').click());
  await step('login: sign in', async () => { await page.fill('#lg-pw', '42!'); await page.locator('#loginForm [type=submit]').click(); await page.waitForURL(/projects/); await page.waitForFunction(() => document.documentElement.classList.contains('ready')); });

  /* projects */
  await step('projects: search', () => page.fill('#pj-q', 'tar'));
  await step('projects: search nothing', () => page.fill('#pj-q', 'zzz'));
  await step('projects: assets', async () => { await page.fill('#pj-q', ''); await page.locator('[data-pf="reuse"]').click(); });
  await step('projects: all', () => page.locator('[data-pf="all"]').click());
  await step('projects: one that does not open', () => page.locator('.pj-row').nth(1).click());
  await step('projects: open', async () => { await page.locator('.pj-row').first().click(); await page.waitForURL(/ide/); await page.waitForFunction(() => document.documentElement.classList.contains('ready')); });

  /* the IDE as it opens, and every tool */
  await step('ide: tab of a pipeline', () => page.locator('#tabs .tab').nth(1).click());
  await step('flow: a step', () => page.locator('#doc .dn').nth(4).click());
  await step('flow: run', () => page.locator('#f-run').click());
  await step('ide: tab of a model', () => page.locator('#tabs .tab').nth(2).click());
  await step('ontology: an entity type', () => page.locator('#doc .en').nth(3).click());
  await step('ontology: into the entity type', () => page.locator('#doc .en').nth(3).dblclick());
  await step('entity: rename an attribute', async () => { const c = page.locator('#doc input[data-f="n"]').first(); await c.fill('serial'); await c.press('Tab'); });
  await step('entity: change a type', () => page.locator('#doc select[data-f="t"]').nth(1).selectOption('datetime'));
  await step('entity: required', () => page.locator('#doc input[data-f="r"]').nth(2).click());
  await step('entity: add an attribute', () => page.locator('#e-add').click());
  await step('entity: name the new attribute', async () => { await typed('firmware'); await page.keyboard.press('Tab'); });
  await step('entity: remove an attribute', () => page.locator('#doc [data-del]').nth(1).click());
  await step('entity: a relation', () => page.locator('#doc [data-ent]').first().click());
  await step('entity: a reference', () => open('Customer'));
  await step('entity: to its model', () => page.locator('#doc .lnk[data-ent]').first().click());
  await step('entity: show in diagram', () => page.locator('#e-dia').click());
  await step('ide: tab of a page', () => page.locator('#tabs .tab', { hasText: 'Home' }).click());
  await step('page: a section', () => page.locator('#pg .bk').nth(1).click());
  await step('page: phone', () => page.locator('#pg-dev [data-w="360"]').click());
  await step('explorer: expand schemas', async () => { await expand('Schemas'); await expand('Source schemas'); });
  await step('schema: open', () => open('Meter reading'));
  await step('schema: a field', async () => { const c = page.locator('#doc input[data-c="0"]').nth(1); await c.fill('readingAt'); await c.press('Tab'); });
  await step('schema: a mapping that is wrong', async () => { const c = page.locator('#doc input[data-c="4"]').nth(2); await c.fill('Meter.nothing'); await c.press('Tab'); });
  await step('schema: required', () => page.locator('#doc input[data-c="2"]').nth(4).click());
  await step('schema: format', () => page.locator('#s-format').selectOption('Avro'));
  await step('schema: add a field', () => page.locator('#s-add').click());
  await step('schema: remove a field', () => page.locator('#doc [data-del]').first().click());
  await step('schema: as JSON', () => page.locator('#s-view [data-v="json"]').click());
  await step('schema: used by', async () => { await page.locator('#s-view [data-v="designer"]').click(); await page.locator('#doc .lnk[data-ent]').first().click(); });
  await step('schema: another', () => open('Weather observation'));
  for (const [area, group, name] of [['AI', 'Models', 'Load forecast'], ['AI', 'Agents', 'Outage triage agent'], ['AI', 'Prompts', 'Summarize outage'], ['AI', 'Evaluation sets', 'Forecast backtest 2025'], ['Data analysis', 'Views', 'Outage heatmap'], ['Data analysis', 'Queries', 'Peak load by feeder'], ['Data analysis', 'Notebooks', 'Forecast error analysis'], ['Portal', 'Pages', 'Outage map'], ['Portal', null, 'Portal theme'], ['Delivery', 'Release pipelines', 'Deploy to production'], ['Delivery', 'Environments', 'Production'], ['Quality', 'Test suites', 'Pipeline regression'], ['Quality', 'Validation procedures', 'Data quality rules'], ['Documentation', null, 'Architecture overview'], ['Documentation', 'Runbooks', 'Pipeline failure']]) {
    await step('tool: ' + name, () => reach(...[area, group, name].filter(Boolean)));
  }
  await step('check: run', async () => { await open('Data quality rules'); await page.locator('#c-run').click(); });
  await step('page: a map without data', async () => { await open('Outage map'); await page.locator('#pg .bk').nth(2).click(); });
  await step('vocabulary', () => reach('Vocabularies', 'Asset types'));
  await step('form: a reference', async () => { await open('Load forecast'); await page.locator('#doc [data-ref]').first().click(); });

  /* the two views of a level, and the files */
  await step('explorer: a level that shows files', async () => { await open('Sources'); });
  await step('explorer: a file of it', () => row('.adp').first().click());
  await step('explorer: view as file system', () => context('Pipelines', 'View As', 'File System'));
  await step('explorer: a pipeline as a folder', async () => { await open('meter-readings-to-bronze'); await expand('meter-readings-to-bronze'); });
  await step('explorer: one of its files', () => open('transform.sql'));
  await step('explorer: show all files', () => context('Pipelines', 'View As', 'Show All Files'));
  await step('explorer: the personal file', () => page.locator('#tree .row', { has: page.locator('.nm:text-is(".user.adp")') }).last().click());
  await step('explorer: ignore a file', async () => { await page.locator('#tree .row', { has: page.locator('.nm:text-is("mapping.yaml")') }).first().click({ button: 'right' }); await item('Git').click(); await sub('Git', 'Add to .gitignore').click(); });
  await step('explorer: back to logical', () => context('Pipelines', 'View As', 'Logical Structure'));
  await step('applications: as files', async () => { await expand('Applications'); await context('Applications', 'View As', 'File System'); });
  await step('applications: a project', async () => { await open('Atlas.ConsoleClient'); await expand('Atlas.ConsoleClient'); });
  await step('applications: a source file', () => open('Program.cs'));
  await step('applications: a project file', () => open('Atlas.ConsoleClient.csproj'));
  await step('applications: all files', () => context('Atlas.ConsoleClient', 'View As', 'Show All Files'));
  await step('applications: a folder git ignores', async () => { await open('bin'); await expand('bin'); await expand('Debug'); await expand('net10.0'); await open('atlas.dll'); });
  await step('applications: python', () => reach('reading-collector', 'reading_collector', 'settings.py'));
  await step('applications: back to logical', () => context('Applications', 'View As', 'Logical Structure'));

  /* the canvas */
  await step('canvas: the root', () => page.locator('#crumbs button').first().click());
  await step('canvas: a card', async () => { const b = await page.locator('#doc .card').nth(2).boundingBox(); await page.mouse.click(b.x + 20, b.y + 12); });
  await step('canvas: zoom', async () => { await page.locator('#cv-in').click(); await page.locator('#cv-in').click(); await page.locator('#cv-out').click(); });
  await step('canvas: fit', () => page.locator('#cv-fit').click());
  await step('canvas: move a card', async () => { const b = await page.locator('#doc .card').nth(5).boundingBox(); await page.mouse.move(b.x + 30, b.y + 12); await page.mouse.down(); await page.mouse.move(b.x + 90, b.y + 60, { steps: 4 }); await page.mouse.up(); });
  await step('canvas: into a card', async () => { const b = await page.locator('#doc .card').first().boundingBox(); await page.mouse.click(b.x + 20, b.y + 12); await page.mouse.click(b.x + 20, b.y + 12); });
  await step('canvas: up', () => page.locator('#cv-up').click());
  await step('canvas: shared layout', () => page.locator('#cv-reset').click());
  await step('canvas: as contents', () => page.locator('#dm [data-dm="editor"]').click());
  await step('contents: an item', () => page.locator('#doc tr.clk').nth(3).click());
  await step('canvas: of a model', async () => { await open('Asset model'); await page.locator('#dm [data-dm="canvas"]').click(); });
  await step('canvas: back to the diagram', () => page.keyboard.press('Alt+c'));

  /* adding, renaming, deleting */
  await step('menu: of a group', () => row('Pipelines').click({ button: 'right' }));
  await step('add: a pipeline', async () => { await page.keyboard.press('Escape'); await context('Pipelines', 'New', 'Data pipeline'); });
  await step('add: name it', async () => { await typed('Billing export'); await page.keyboard.press('Enter'); });
  await step('rename: to a name that is taken', async () => { await row('Billing export').click(); await page.keyboard.press('F2'); await typed('Customer sync'); await page.keyboard.press('Enter'); });
  await step('rename: leave it', () => page.keyboard.press('Escape'));
  await step('rename: an existing item', async () => { await row('Telemetry stream').click(); await page.keyboard.press('F2'); await typed('Telemetry feed'); await page.keyboard.press('Enter'); });
  await step('add: an entity type', async () => { await context('Customer model', 'New', 'Entity type'); await typed('Invoice'); await page.keyboard.press('Enter'); });
  await step('add: its model', () => open('Customer model'));
  await step('add: a group in an area', async () => { await context('Documentation', 'New', 'Group'); await typed('Guides'); await page.keyboard.press('Enter'); });
  await step('add: a document in it', async () => { await context('Guides', 'New', 'Document'); await typed('Style guide'); await page.keyboard.press('Enter'); });
  await step('delete: an item', async () => { await row('Weather enrichment').click(); await page.locator('#tree').press('Delete'); });
  await step('delete: undo', () => page.locator('.toast button').click());
  await step('delete: a group', async () => { await row('Guides').click(); await page.locator('#tree').press('Delete'); });
  await step('icon: the picker', () => context('Billing export', 'Change Icon…'));
  await step('icon: search', () => page.fill('#ip-q', 'rocket'));
  await step('icon: choose', () => page.locator('#ip-q').press('Enter'));
  await step('icon: back to the default', async () => { await context('Billing export', 'Change Icon…'); await page.locator('.ipick > .mi[data-ic=""]').click(); });
  await step('link: the dialog', () => context('Components', 'Link Repository…'));
  await step('link: link it', () => page.locator('.dlg .btn.pri').click());
  await step('link: follow another tag', () => context('Notification service', 'Switch Branch or Tag', 'v1.3.2'));
  await step('link: update', () => context('Notification service', 'Update from Remote'));
  await step('link: read-only inside', async () => { await open('Email template'); await row('Email template').click({ button: 'right' }); });
  await step('link: unlink', async () => { await page.keyboard.press('Escape'); await context('Notification service', 'Unlink Repository'); });
  await step('git: rollback', () => context('Telemetry feed', 'Git', 'Rollback…'));
  await step('copy: id', () => context('Pipelines', 'Copy', 'ID'));

  /* the properties */
  await step('properties: of a linked repository', () => open('Design system'));
  await step('properties: follow another tag', () => page.locator('#p-ref').selectOption('v3.1.4'));
  await step('properties: rename', async () => { await open('Customer sync'); await page.fill('#p-name', 'Customer synchronisation'); await page.locator('#p-name').press('Tab'); });
  await step('properties: a name that is taken', async () => { await page.fill('#p-name', 'Billing export'); await page.locator('#p-name').press('Tab'); });
  await step('properties: view as', async () => { await open('Quality'); await page.locator('#p-mode').selectOption('files'); });
  await step('properties: show all files', () => page.locator('#p-all').click());
  await step('properties: back', () => page.locator('#p-mode').selectOption('logical'));
  await step('properties: icon', async () => { await page.locator('#p-icon').click(); await page.fill('#ip-q', 'shield'); });
  await step('properties: icon closed', () => page.keyboard.press('Escape'));

  /* the tool windows */
  await step('problems: show', () => stripe('problems'));
  await step('problems: no notes', () => panel('problems').locator('[data-s="info"]').click());
  await step('problems: go to one', () => panel('problems').locator('.prb button').nth(1).click());
  await step('commit: show', () => stripe('commit'));
  await step('commit: leave a file out', () => panel('commit').locator('.cm-f input').nth(1).click());
  await step('commit: leave an item out', () => panel('commit').locator('.cm-g input').nth(3).click());
  await step('commit: no message', async () => { await page.fill('#cm-msg', ''); await page.locator('#cm-go').click(); });
  await step('commit: commit', async () => { await page.fill('#cm-msg', 'Add the billing export'); await page.locator('#cm-go').click(); });
  await step('git: a commit', () => panel('git').locator('.g-row').nth(2).click());
  await step('git: one branch', () => panel('git').locator('[data-b="features/load-forecast"]').click());
  await step('git: all branches', async () => { await page.locator('#g-fb').click(); await item('All branches').click(); });
  await step('git: one user', async () => { await page.locator('#g-fu').click(); await item('Me').click(); });
  await step('git: this week', async () => { await page.locator('#g-fu').click(); await item('Everyone').click(); await page.locator('#g-fd').click(); await item('Last 7 days').click(); });
  await step('git: search', async () => { await page.locator('#g-fd').click(); await item('Any time').click(); await page.fill('#g-q', 'ontology'); });
  await step('git: fetch', async () => { await page.fill('#g-q', ''); await page.locator('#g-fetch').click(); });
  await step('git: a linked repository', () => panel('git').locator('[data-open]').nth(1).click());
  await step('title: push with commits to take in', () => page.locator('#w-push').click());
  await step('title: update from the toast', () => page.locator('.toast button').click());
  await step('title: push', () => page.locator('#w-push').click());
  await step('title: nothing to push', () => page.locator('#w-push').click());
  await step('title: nothing to pull', () => page.locator('#w-pull').click());
  await step('commit: take the rest', async () => { const left = panel('commit').locator('.cm-g input:not(:checked)'); while (await left.count()) await left.first().click(); });
  await step('commit: commit and push', async () => { await page.fill('#cm-msg', 'The rest'); await page.locator('#cm-push').click(); });
  await step('commit: nothing left', () => stripe('explorer'));

  /* the title bar */
  for (const m of ['File', 'Edit', 'View', 'Navigate', 'Tools', 'Git', 'Window', 'Help']) await step('menu: ' + m, async () => { await page.keyboard.press('Escape'); await top(m); });
  await step('menu: validate', async () => { await page.keyboard.press('Escape'); await top('Tools', 'Validate Solution'); });
  await step('menu: run test suites', () => top('Tools', 'Run Test Suites'));
  await step('menu: new item', () => top('File', 'New Item…'));
  await step('menu: branch', async () => { await page.keyboard.press('Escape'); await page.locator('#w-branch').click(); });
  await step('menu: project', async () => { await page.keyboard.press('Escape'); await page.locator('#w-proj').click(); });
  await step('menu: another project', () => page.locator('body > .menu > .mi').nth(1).click());
  await step('menu: run', () => page.locator('#w-run').click());
  await step('menu: run another', () => page.locator('body > .menu > .mi').nth(3).click());
  await step('title: go', () => page.locator('#w-go').click());
  await step('title: fetch', () => page.locator('#w-fetch').click());
  await step('menu: user', () => page.locator('#w-user').click());
  await step('menu: settings', async () => { await page.keyboard.press('Escape'); await page.locator('#w-gear').click(); });
  await step('settings: light', () => item('Light').click());
  await step('settings: large', async () => { await page.locator('#w-gear').click(); await item('Large').click(); });
  await step('settings: compact', async () => { await page.locator('#w-gear').click(); await item('Compact').click(); });
  await step('settings: back', async () => { await page.locator('#w-gear').click(); await item('Follow the system').click(); await page.locator('#w-gear').click(); await page.locator('body > .menu > .mi', { hasText: 'Default' }).first().click(); await page.locator('#w-gear').click(); await page.locator('body > .menu > .mi', { hasText: 'Default' }).nth(1).click(); });

  /* the docks, the search and the tabs */
  await step('docks: move a tool window', async () => { await panel('git').locator('[data-pm]').click(); await item('Right').click(); });
  await step('docks: hide one', () => panel('git').locator('[data-hide]').click());
  await step('docks: default layout', () => top('Window', 'Restore Default Layout'));
  await step('explorer: search', () => page.fill('#ex-q', 'meter'));
  await step('explorer: collapse all', async () => { await page.fill('#ex-q', ''); await page.locator('#ex-col').click(); });
  await step('explorer: locate', () => page.locator('#ex-loc').click());
  await step('tabs: close one', () => page.locator('#tabs .tab .x').nth(1).click());
  await step('tabs: close all', () => top('Window', 'Close All Tabs'));
  await step('keys: down and right', async () => { await page.locator('#tree').focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown'); });
  await step('navigate: up one level', () => top('Navigate', 'Up One Level'));
  await step('leave: sign out', async () => { await top('File', 'Sign Out'); await page.waitForURL(/login/); await page.waitForFunction(() => document.documentElement.classList.contains('ready')); });
  return { trace, problems };
}

/* Ids and commit hashes that are made anew on every visit are replaced by the order in which they first show, so two visits can be compared. */
export function normalise(trace) {
  /* a message that says what was done stays for a few seconds, so it shows in the steps that happen to follow; it counts in the step it came up in */
  trace = trace.map((step, i) => step.popups ? { ...step, popups: step.popups.filter(p => !(p.startsWith('<div class="toast"') && trace[i - 1]?.popups?.includes(p))) } : step);
  const seen = new Map(), name = (kind, v) => { if (!seen.has(v)) seen.set(v, `${kind}${seen.size}`); return seen.get(v); };
  /* who last changed an item is worked out from its id, so for a new item it differs per visit */
  const last = /(Last change<\/span><\/span><span><span class=\\"v\\" title=\\")[^"\\]*(\\">)[^<]*(<)/g;
  /* a project is found by its id, where it once was by its name; neither says anything about how the page behaves */
  const project = /data-p=\\"[^"\\]*\\"/g;
  return JSON.parse(JSON.stringify(trace).replace(last, '$1$2$3').replace(project, 'data-p').replace(/ id=\\"pj-(ver|me)\\"/g, '').replace(/(?<![0-9a-z])[0-9a-z]{25}(?![0-9a-z])/g, v => name('ID', v)).replace(/(<span class=\\"mono\\">)([0-9a-f]{7})(<\/span>)/g, (_a, a, v, b) => a + name('HASH', v) + b));
}

/* the differences between two traces, step by step and region by region */
export function compare(a, b, limit = 400) {
  const out = [];
  const flat = (o, at, into) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) flat(o[k], at ? at + '.' + k : k, into); else into[at] = o; return into; };
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i], y = b[i];
    if (!x || !y) { out.push(`step ${i}: only one side has it (${(x ?? y).label})`); continue; }
    const fx = flat(x, '', {}), fy = flat(y, '', {});
    for (const k of new Set([...Object.keys(fx), ...Object.keys(fy)])) {
      if (fx[k] === fy[k]) continue;
      const s = String(fx[k]), t = String(fy[k]);
      let at = 0; while (at < s.length && s[at] === t[at]) at++;
      out.push(`step ${i} "${x.label}" ${k}:\n    a: …${s.slice(Math.max(0, at - 80), at + limit)}\n    b: …${t.slice(Math.max(0, at - 80), at + limit)}`);
    }
  }
  return out;
}
