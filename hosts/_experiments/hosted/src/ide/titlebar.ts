/* The title bar (menus, project and branch widgets, update and push, run, settings) and the status bar. */
import { $, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { go } from '../common/nav';
import { menu, menuAt, type MenuEntry } from '../common/popups';
import { setTheme, setVar } from '../common/prefs';
import { visit } from '../storage';
import { fullScreen, isFullScreen } from './browser';
import { PAN, panelIds, resetLayout, show, toggle } from './docks';
import { linkRepo, newItemMenu, rename } from './explorer';
import { K } from './kinds';
import { binary, crumbsOf, linkedRepos, modeOf, ofKind, path, ro, ROOT } from './model';
import { flip, levelOf, openDoc, pick } from './open';
import { repaint, repaintEverything } from './repaint';
import type { Item } from './types';
import { keep, settle, S } from './state';
import { act, project, refused, storage } from './storage';

const search = (): void => { show('explorer'); $('#ex-q').focus(); };
/* what the Git commands answer shows where the branch does: the log, the title bar and the status bar */
const git = (command: Promise<{ message: string }>): void => { void act(command).then(done => { if (done) repaint('git', 'title', 'status'); }); };
const fetched = (): void => git(project.git.fetch());
/* takes the commits of the upstream branch in */
const pull = (): void => git(project.git.pull());
const push = (): void => git(project.git.push());
/* takes the last change back, or does it again; what was selected or open and is gone gives way to what is there */
const undo = (again = false): void => { void act(again ? project.history.redo() : project.history.undo()).then(done => { if (done) { settle(); repaintEverything(); } }); };
const signOut = (): void => { void storage.identity.signOut().catch(() => undefined); go('login'); };

/* the menus of the title bar, made when one is opened, so each shows what is true then */
const menus = (): Record<string, MenuEntry[]> => ({
  File: [{ l: 'New Item…', k: 'Ctrl+N', on: () => menu(newItemMenu(), 220, 60) }, { l: 'Open Project…' }, { l: 'Link Repository…', on: () => linkRepo(project.solution.suggestedLink.parent ?? ROOT) }, '-', { l: 'Settings…', k: 'Ctrl+Alt+S' }, '-', { l: 'Close Project', on: () => go('projects') }, { l: 'Sign Out', on: signOut }],
  Edit: [{ l: 'Undo', k: 'Ctrl+Z', d: project.history.undoLabel ? null : 'Nothing to undo', on: () => undo() }, { l: 'Redo', k: 'Ctrl+Y', d: project.history.redoLabel ? null : 'Nothing to redo', on: () => undo(true) }, '-', { l: 'Rename…', k: 'F2', on: () => { if (!S.sel.pseudo && !ro(S.sel)) rename(S.sel); } }, { l: 'Find in Items…', k: 'Ctrl+Shift+F', on: search }],
  View: [{ h: 'Tool windows' }, ...panelIds.map(id => ({ l: PAN[id][0], get chk() { return S.act[S.dock[id]] === id; }, on: () => toggle(id) })), '-', { l: 'Switch Document and Canvas', k: 'Alt+C', on: flip }, { l: 'Restore Default Layout', on: resetLayout }, '-', { l: 'Full Screen', k: 'F11', get chk() { return isFullScreen(); }, on: fullScreen }],
  Navigate: [{ l: 'Search Everywhere', k: 'Shift Shift', on: search }, { l: 'Go to Item by ID…' }, { l: 'Select Open Document in Explorer', on: () => pick(S.doc) }, { l: 'Up One Level', on: () => { if (S.doc.parent) openDoc(S.doc.parent); } }],
  Tools: [{ l: 'Validate Solution', on: () => { show('problems'); void act(project.status.validate()); } }, { l: 'Run Test Suites', on: () => void act(project.status.runTestSuites()) }, { l: 'Generate Documentation' }],
  Git: [{ l: 'Commit…', k: 'Ctrl+K', on: () => show('commit') }, { l: 'Push…', k: 'Ctrl+Shift+K', on: push }, { l: 'Update Project…', k: 'Ctrl+T', on: pull }, { l: 'Fetch', on: fetched }, '-', { l: 'New Branch…' }, { l: 'Show Git Log', on: () => show('git') }],
  Window: [{ l: 'Restore Default Layout', on: resetLayout }, { l: 'Close All Tabs', on: () => { S.tabs = []; openDoc(ROOT); } }],
  Help: [{ l: 'Getting Started' }, { l: 'Keyboard Shortcuts' }, { l: 'About ADP ' + storage.catalogue.product }],
});
const MENU_NAMES = ['File', 'Edit', 'View', 'Navigate', 'Tools', 'Git', 'Window', 'Help'];

export function renderTitle(): void {
  const { branch, behind, ahead } = project.git;
  $('#w-branch').innerHTML = `${ico('branch', 'c-muted')}<span>${esc(branch)}</span>`;
  $('#w-pull').innerHTML = `${ico('down', behind ? 'c-blue' : '')}<b>${behind || ''}</b>`;
  $('#w-push').innerHTML = `${ico('up', ahead ? 'c-green' : '')}<b>${ahead || ''}</b>`;
}

/* true while an answer of the storage takes long enough to say so */
let waiting = false;
/* what the status bar says of the storage, when it is not simply there */
const storageNote = (): string => storage.state === 'offline' ? 'Storage offline' : storage.state === 'connecting' ? 'Connecting to the storage…' : waiting ? 'Waiting for the storage…' : '';

export function renderStatus(): void {
  const x = S.sel, count = (s: string) => project.status.problems.filter(p => p.s === s).length, { branch, behind, ahead, fetched: when } = project.git, note = storageNote(), code = x.pseudo ? !x.entries && !binary(x) : K[x.kind].tool === 'code';
  $('#status').innerHTML = `<span class="st path" title="${esc(path(x))}">${crumbsOf(x).map(p => esc(p.name)).join(' › ')}</span>
   <button class="st" data-tw="problems" title="Open Problems">${ico('error', 'c-red')}${count('error')}${ico('warning', 'c-yellow')}${count('warning')}</button>
   <span class="st mono hide-s" title="Hidden item ID">ID ${x.id}</span>
   <span class="st hide-s">${x.entries ? 'Folder' : x.pseudo ? 'File' : modeOf(levelOf(x)) === 'files' ? 'File System' : 'Logical Structure'}</span>
   ${code ? '<span class="st hide-s">Ln 1, Col 1 · LF · UTF-8</span>' : ''}
   <span class="st hide-s">${ico('link')}${linkedRepos().length} linked repositories</span>
   ${project.status.environments.map(e => `<span class="st hide-s"><span class="led"></span>${esc(e.note)}</span>`).join('')}
   <button class="st" data-tw="git" title="Open Git">${ico('branch')}${esc(branch)} ${behind ? '↓' + behind : ''} ${ahead ? '↑' + ahead : ''}</button>
   <span class="st hide-s">${esc(when)}</span>${note ? `<span class="st" id="st-storage" role="status">${ico(storage.state === 'offline' ? 'warning' : 'fetch', storage.state === 'offline' ? 'c-yellow' : 'c-muted')}${note}</span>` : ''}`;
}

/* what the run button starts: what a person picked, or what the project starts by itself */
const running = (): Item | null => S.run ?? project.status.defaultRun;

/* fills the title bar's buttons and wires them, with the shortcut that switches between tool and canvas */
export function mountTitlebar(): void {
  const root = document.documentElement, at = (e: MouseEvent): HTMLElement => e.currentTarget as HTMLElement;
  const { info } = project, { user } = storage.identity;
  document.title = `${info.name} · ADP`;
  $('#menus').innerHTML = MENU_NAMES.map(m => `<button class="tbtn" data-m="${m}">${m}</button>`).join('');
  $('#menus').onclick = e => { const b = hit(e, '[data-m]'); if (b) menuAt(b, menus()[b.dataset.m!]); };
  $('#burger').innerHTML = ico('menu');
  $('#burger').onclick = e => { const all = menus(); menuAt(at(e), [...MENU_NAMES.map(m => ({ l: m, sub: all[m] })), '-', { h: 'Go to' }, { l: 'Start', on: () => go('start') }, { l: 'Login', on: () => go('login') }, { l: 'Projects', on: () => go('projects') }]); };
  /* another project opens in this window, when it can be opened here */
  const open = (id: string): void => { storage.projects.open(id).then(() => { project.workbench.keepNow(); visit.set('project', id); location.reload(); }, refused); };
  $('#w-proj').innerHTML = `<span class="pbadge">${esc(info.initials)}</span><span>${esc(info.name)}</span>`;
  $('#w-proj').onclick = e => menuAt(at(e), [{ h: 'Open project' }, { l: info.name, chk: true }, { h: 'Recent' }, ...storage.projects.list.filter(p => p.id !== info.id && !p.asset).slice(0, 2).map(p => ({ l: p.name, on: () => open(p.id) })), '-', { l: 'All Projects…', on: () => go('projects') }, { l: 'Close Project', on: () => go('projects') }]);
  const refs = (kind: string): MenuEntry[] => project.git.refs.filter(r => r.kind === kind).map(r => ({ l: r.name, chk: r.name === project.git.branch }));
  $('#w-branch').onclick = e => menuAt(at(e), [{ l: 'Update Project…', k: 'Ctrl+T', i: 'down', on: pull }, { l: 'Commit…', k: 'Ctrl+K', i: 'commit', on: () => show('commit') }, { l: 'Push…', k: 'Ctrl+Shift+K', i: 'up', on: push }, { l: 'Fetch', i: 'fetch', on: fetched }, '-', { l: 'New Branch…', i: 'plus' }, { l: 'Checkout Tag or Revision…' }, '-', { h: 'Local' }, ...refs('local'), { h: 'Remote' }, ...refs('remote')]);
  $('#w-pull').onclick = pull;
  $('#w-push').onclick = push;
  $('#w-fetch').innerHTML = ico('fetch');
  $('#w-fetch').onclick = fetched;

  const runButton = (): void => { $('#w-run').innerHTML = `${ico('rocket', 'c-red')}<span>${esc(running()?.name ?? 'Nothing to run')}</span>`; };
  /* what can be started: the items of a kind, under the name of that kind */
  const runs = (kind: string): MenuEntry[] => { const items = ofKind(kind); return items.length ? [{ h: K[kind].label + 's' }, ...items.map(k => ({ l: k.name, chk: running() === k, on: () => { S.run = k; runButton(); keep(); } }))] : []; };
  runButton();
  $('#w-run').onclick = e => menuAt(at(e), [...runs('release'), ...runs('testsuite')]);
  $('#w-go').innerHTML = ico('play');
  $('#w-go').onclick = () => { const x = running(); if (x) void act(project.status.run(x, true)); };
  $('#w-search').innerHTML = ico('search');
  $('#w-search').onclick = search;

  $('#w-gear').innerHTML = ico('gear');
  $('#w-gear').onclick = e => {
    const r = at(e).getBoundingClientRect(), theme = root.dataset.theme, style = getComputedStyle(root), fs = style.getPropertyValue('--fs').trim(), row = style.getPropertyValue('--row').trim();
    const sizes: [string, string][] = [['12px', 'Small'], ['13px', 'Default'], ['14px', 'Large']], densities: [string, string][] = [['22px', 'Compact'], ['24px', 'Default'], ['28px', 'Comfortable']];
    menu([{ h: 'Theme' }, { l: 'Dark', chk: theme === 'dark', on: () => setTheme('dark') }, { l: 'Light', chk: theme === 'light', on: () => setTheme('light') }, { l: 'Follow the system', chk: !theme, on: () => setTheme(null) }, { h: 'Font size' }, ...sizes.map(([v, l]) => ({ l, chk: fs === v, on: () => setVar('--fs', v) })), { h: 'Density' }, ...densities.map(([v, l]) => ({ l, chk: row === v, on: () => setVar('--row', v) })), '-', { l: 'Restore Default Layout', on: resetLayout }, { l: 'All Settings…', k: 'Ctrl+Alt+S' }], r.right - 210, r.bottom + 3);
  };
  $('#w-user').title = user.name;
  $('#w-user').innerHTML = `<span class="avatar">${esc(user.initials)}</span>`;
  $('#w-user').onclick = e => {
    const r = at(e).getBoundingClientRect();
    menu([{ h: `${user.name} · ${user.email}` }, { l: 'Account Settings…', i: 'user' }, { l: 'Switch Project…', on: () => go('projects') }, '-', { l: 'Sign Out', on: signOut }], r.right - 230, r.bottom + 3);
  };

  storage.onWaiting(on => { waiting = on; renderStatus(); });
  storage.onState(renderStatus);

  /* Alt+C switches between tool and canvas; Ctrl+Z and Ctrl+Y take a change back and do it again, except in a text field, where they belong to the typing */
  addEventListener('keydown', e => {
    const key = e.key.toLowerCase(), t = e.target, typing = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || (t instanceof HTMLElement && t.isContentEditable);
    if (e.altKey && key === 'c') { e.preventDefault(); flip(); }
    else if ((e.ctrlKey || e.metaKey) && !e.altKey && !typing && (key === 'z' || key === 'y')) { e.preventDefault(); undo(key === 'y' || e.shiftKey); }
  });
}
