/* What the scripts draw in the title bar and the status bar: the menus, what the widgets say, and the status of the selected item, of validation, of git and of the storage. The widgets themselves are part of the page. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.tsx';

/* the menus of the title bar; open gets the name of the one that was clicked, and its button */
export const Menus = ({ names, open }: { names: readonly string[]; open: (name: string, button: HTMLElement) => void }): VNode =>
  <>{names.map(m => <button class="tbtn" data-m={m} onClick={e => open(m, e.currentTarget)}>{m}</button>)}</>;

/* what the project widget says: the project that is open */
export const ProjectLabel = ({ initials, name }: { initials: string; name: string }): VNode => <><span class="pbadge">{initials}</span><span>{name}</span></>;
/* what the branch widget says: the branch that is checked out */
export const BranchLabel = ({ branch }: { branch: string }): VNode => <>{ico('branch', 'c-muted')}<span>{branch}</span></>;
/* what the update and push buttons say: how many commits there are to take in or to push, in colour when there are any */
export const CommitCount = ({ icon, colour, count }: { icon: string; colour: string; count: number }): VNode => <>{ico(icon, count ? colour : '')}<b>{count || ''}</b></>;
/* what the run widget says: what the run button starts */
export const RunLabel = ({ name }: { name: string }): VNode => <>{ico('rocket', 'c-red')}<span>{name}</span></>;
export const Avatar = ({ initials }: { initials: string }): VNode => <span class="avatar">{initials}</span>;

/* what the status bar says of the storage, when it is not simply there */
export interface StorageNote { text: string; offline: boolean }

/* trail is where the selected item is in the hierarchy; view is how its level shows; code says that it is text with lines; toggle shows or hides a tool window */
export const Status = ({ trail, path, id, errors, warnings, view, code, linked, environments, branch, behind, ahead, fetched, storage, toggle }: {
  trail: string; path: string; id: string; errors: number; warnings: number; view: string; code: boolean; linked: number; environments: readonly string[];
  branch: string; behind: number; ahead: number; fetched: string; storage: StorageNote | null; toggle: (toolWindow: 'problems' | 'git') => void;
}): VNode =>
  <>
    <span class="st path" title={path}>{trail}</span>
    <button class="st" data-tw="problems" title="Open Problems" onClick={() => toggle('problems')}>{ico('error', 'c-red')}{errors}{ico('warning', 'c-yellow')}{warnings}</button>
    <span class="st mono hide-s" title="Hidden item ID">{`ID ${id}`}</span>
    <span class="st hide-s">{view}</span>
    {code ? <span class="st hide-s">Ln 1, Col 1 · LF · UTF-8</span> : ''}
    <span class="st hide-s">{ico('link')}{`${linked} linked repositories`}</span>
    {environments.map(note => <span class="st hide-s"><span class="led"></span>{note}</span>)}
    <button class="st" data-tw="git" title="Open Git" onClick={() => toggle('git')}>{ico('branch')}{`${branch} ${behind ? '↓' + behind : ''} ${ahead ? '↑' + ahead : ''}`}</button>
    <span class="st hide-s">{fetched}</span>
    {storage ? <span class="st" id="st-storage" role="status">{ico(storage.offline ? 'warning' : 'fetch', storage.offline ? 'c-yellow' : 'c-muted')}{storage.text}</span> : ''}
  </>;
