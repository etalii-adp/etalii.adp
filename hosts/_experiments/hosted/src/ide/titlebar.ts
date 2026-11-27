/* The title bar (menus, project and branch widgets, update and push, run, settings) and the status bar. */
import { $, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { go } from '../common/nav';
import { only } from '../common/page';
import { menu, menuAt, toast, type MenuEntry } from '../common/popups';
import { setTheme, setVar } from '../common/prefs';
import { fullScreen, isFullScreen } from './browser';
import { COMMITS, HEADS, WHO } from './data/commits';
import { PROBLEMS } from './data/problems';
import { PAN, panelIds, resetLayout, show, toggle } from './docks';
import { linkRepo, newItemMenu, rename } from './explorer';
import { gitHash } from './git';
import { K } from './kinds';
import { binary, crumbsOf, find, linkedRepos, modeOf, path, ro, ROOT } from './model';
import { flip, levelOf, openDoc, pick } from './open';
import { repaint } from './repaint';
import { S } from './state';

const fetched = (): void => toast('Fetched origin. Nothing new since 4 minutes ago.');
const search = (): void => { show('explorer'); $('#ex-q').focus(); };

/* takes the commits of origin/develop in, with a merge commit on top of the log */
function pull(): void {
  if (!S.behind) { toast('develop is up to date with origin/develop'); return; }
  COMMITS.forEach(cm => { cm.p = cm.p.map(i => i + 1); });
  for (const k in HEADS) HEADS[k]++;
  COMMITS.unshift({ h: gitHash(), l: 0, p: [1, HEADS['origin/develop']], m: "Merge remote-tracking branch 'origin/develop' into develop", a: WHO[0], w: 'Just now', d: 0 });
  HEADS.develop = 0;
  const incoming = S.behind;
  S.behind = 0;
  S.ahead++;
  repaint('git', 'title', 'status');
  toast(`Merged ${incoming} incoming commits into develop`);
}
function push(): void {
  if (!S.ahead) { toast('Nothing to push'); return; }
  const outgoing = S.ahead;
  if (S.behind) { toast('Update the project first: origin/develop has ' + S.behind + ' commits you do not have.', 'Update', pull); return; }
  HEADS['origin/develop'] = HEADS.develop;
  S.ahead = 0;
  repaint('git', 'title', 'status');
  toast(`Pushed ${outgoing} commits to origin/develop`);
}

const MENUS: Record<string, MenuEntry[]> = {
  File: [{ l: 'New Item…', k: 'Ctrl+N', on: () => menu(newItemMenu(), 220, 60) }, { l: 'Open Project…' }, { l: 'Link Repository…', on: () => linkRepo(find('Components') ?? ROOT) }, '-', { l: 'Settings…', k: 'Ctrl+Alt+S' }, '-', { l: 'Close Project', on: () => go('projects') }, { l: 'Sign Out', on: () => go('login') }],
  Edit: [{ l: 'Undo', k: 'Ctrl+Z' }, { l: 'Redo', k: 'Ctrl+Y' }, '-', { l: 'Rename…', k: 'F2', on: () => { if (!S.sel.pseudo && !ro(S.sel)) rename(S.sel); } }, { l: 'Find in Items…', k: 'Ctrl+Shift+F', on: search }],
  View: [{ h: 'Tool windows' }, ...panelIds.map(id => ({ l: PAN[id][0], get chk() { return S.act[S.dock[id]] === id; }, on: () => toggle(id) })), '-', { l: 'Switch Document and Canvas', k: 'Alt+C', on: flip }, { l: 'Restore Default Layout', on: resetLayout }, '-', { l: 'Full Screen', k: 'F11', get chk() { return isFullScreen(); }, on: fullScreen }],
  Navigate: [{ l: 'Search Everywhere', k: 'Shift Shift', on: search }, { l: 'Go to Item by ID…' }, { l: 'Select Open Document in Explorer', on: () => pick(S.doc) }, { l: 'Up One Level', on: () => { if (S.doc.parent) openDoc(S.doc.parent); } }],
  Tools: [{ l: 'Validate Solution', on: () => { show('problems'); toast('Validated 96 items: 2 errors, 3 warnings, 3 notes'); } }, { l: 'Run Test Suites', on: () => toast('3 test suites queued on Staging') }, { l: 'Generate Documentation' }],
  Git: [{ l: 'Commit…', k: 'Ctrl+K', on: () => show('commit') }, { l: 'Push…', k: 'Ctrl+Shift+K', on: push }, { l: 'Update Project…', k: 'Ctrl+T', on: pull }, { l: 'Fetch', on: fetched }, '-', { l: 'New Branch…' }, { l: 'Show Git Log', on: () => show('git') }],
  Window: [{ l: 'Restore Default Layout', on: resetLayout }, { l: 'Close All Tabs', on: () => { S.tabs = []; openDoc(ROOT); } }],
  Help: [{ l: 'Getting Started' }, { l: 'Keyboard Shortcuts' }, { l: 'About ADP 2026.3' }],
};

export function renderTitle(): void {
  $('#w-branch').innerHTML = `${ico('branch', 'c-muted')}<span>develop</span>`;
  $('#w-pull').innerHTML = `${ico('down', S.behind ? 'c-blue' : '')}<b>${S.behind || ''}</b>`;
  $('#w-push').innerHTML = `${ico('up', S.ahead ? 'c-green' : '')}<b>${S.ahead || ''}</b>`;
}

export function renderStatus(): void {
  const x = S.sel, count = (s: string) => PROBLEMS.filter(p => p.s === s).length, code = x.pseudo ? !x.entries && !binary(x) : K[x.kind].tool === 'code';
  $('#status').innerHTML = `<span class="st path" title="${esc(path(x))}">${crumbsOf(x).map(p => esc(p.name)).join(' › ')}</span>
   <button class="st" data-tw="problems" title="Open Problems">${ico('error', 'c-red')}${count('error')}${ico('warning', 'c-yellow')}${count('warning')}</button>
   <span class="st mono hide-s" title="Hidden item ID">ID ${x.id}</span>
   <span class="st hide-s">${x.entries ? 'Folder' : x.pseudo ? 'File' : modeOf(levelOf(x)) === 'files' ? 'File System' : 'Logical Structure'}</span>
   ${code ? '<span class="st hide-s">Ln 1, Col 1 · LF · UTF-8</span>' : ''}
   <span class="st hide-s">${ico('link')}${linkedRepos().length} linked repositories</span>
   <span class="st hide-s"><span class="led"></span>Staging healthy</span>
   <button class="st" data-tw="git" title="Open Git">${ico('branch')}develop ${S.behind ? '↓' + S.behind : ''} ${S.ahead ? '↑' + S.ahead : ''}</button>
   <span class="st hide-s">Fetched 4 min ago</span>`;
}

/* what the run button starts */
let running = 'Deploy to staging';

/* fills the title bar's buttons and wires them, with the shortcut that switches between tool and canvas */
export function mountTitlebar(): void {
  const root = document.documentElement, at = (e: MouseEvent): HTMLElement => e.currentTarget as HTMLElement;
  $('#menus').innerHTML = Object.keys(MENUS).map(m => `<button class="tbtn" data-m="${m}">${m}</button>`).join('');
  $('#menus').onclick = e => { const b = hit(e, '[data-m]'); if (b) menuAt(b, MENUS[b.dataset.m!]); };
  $('#burger').innerHTML = ico('menu');
  $('#burger').onclick = e => menuAt(at(e), [...Object.keys(MENUS).map(m => ({ l: m, sub: MENUS[m] })), '-', { h: 'Go to' }, { l: 'Start', on: () => go('start') }, { l: 'Login', on: () => go('login') }, { l: 'Projects', on: () => go('projects') }]);
  $('#w-proj').onclick = e => menuAt(at(e), [{ h: 'Open project' }, { l: 'Atlas Platform', chk: true }, { h: 'Recent' }, { l: 'Field Service App', on: only }, { l: 'Tariff Calculator', on: only }, '-', { l: 'All Projects…', on: () => go('projects') }, { l: 'Close Project', on: () => go('projects') }]);
  $('#w-branch').onclick = e => menuAt(at(e), [{ l: 'Update Project…', k: 'Ctrl+T', i: 'down', on: pull }, { l: 'Commit…', k: 'Ctrl+K', i: 'commit', on: () => show('commit') }, { l: 'Push…', k: 'Ctrl+Shift+K', i: 'up', on: push }, { l: 'Fetch', i: 'fetch', on: fetched }, '-', { l: 'New Branch…', i: 'plus' }, { l: 'Checkout Tag or Revision…' }, '-', { h: 'Local' }, { l: 'develop', chk: true }, { l: 'features/load-forecast' }, { h: 'Remote' }, { l: 'origin/develop' }, { l: 'origin/features/outage-map' }]);
  $('#w-pull').onclick = pull;
  $('#w-push').onclick = push;
  $('#w-fetch').innerHTML = ico('fetch');
  $('#w-fetch').onclick = fetched;

  const runButton = (): void => { $('#w-run').innerHTML = `${ico('rocket', 'c-red')}<span>${running}</span>`; };
  const runs = (group: string): MenuEntry[] => (find(group)?.children ?? []).map(k => ({ l: k.name, chk: running === k.name, on: () => { running = k.name; runButton(); } }));
  runButton();
  $('#w-run').onclick = e => menuAt(at(e), [{ h: 'Release pipelines' }, ...runs('Release pipelines'), { h: 'Test suites' }, ...runs('Test suites')]);
  $('#w-go').innerHTML = ico('play');
  $('#w-go').onclick = () => toast(running + ' started');
  $('#w-search').innerHTML = ico('search');
  $('#w-search').onclick = search;

  $('#w-gear').innerHTML = ico('gear');
  $('#w-gear').onclick = e => {
    const r = at(e).getBoundingClientRect(), theme = root.dataset.theme, style = getComputedStyle(root), fs = style.getPropertyValue('--fs').trim(), row = style.getPropertyValue('--row').trim();
    const sizes: [string, string][] = [['12px', 'Small'], ['13px', 'Default'], ['14px', 'Large']], densities: [string, string][] = [['22px', 'Compact'], ['24px', 'Default'], ['28px', 'Comfortable']];
    menu([{ h: 'Theme' }, { l: 'Dark', chk: theme === 'dark', on: () => setTheme('dark') }, { l: 'Light', chk: theme === 'light', on: () => setTheme('light') }, { l: 'Follow the system', chk: !theme, on: () => setTheme(null) }, { h: 'Font size' }, ...sizes.map(([v, l]) => ({ l, chk: fs === v, on: () => setVar('--fs', v) })), { h: 'Density' }, ...densities.map(([v, l]) => ({ l, chk: row === v, on: () => setVar('--row', v) })), '-', { l: 'Restore Default Layout', on: resetLayout }, { l: 'All Settings…', k: 'Ctrl+Alt+S' }], r.right - 210, r.bottom + 3);
  };
  $('#w-user').onclick = e => {
    const r = at(e).getBoundingClientRect();
    menu([{ h: 'Sam Rivera · sam.rivera@example.com' }, { l: 'Account Settings…', i: 'user' }, { l: 'Switch Project…', on: () => go('projects') }, '-', { l: 'Sign Out', on: () => go('login') }], r.right - 230, r.bottom + 3);
  };

  addEventListener('keydown', e => { if (e.altKey && e.key.toLowerCase() === 'c') { e.preventDefault(); flip(); } });
}
