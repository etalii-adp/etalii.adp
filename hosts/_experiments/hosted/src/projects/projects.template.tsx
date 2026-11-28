/* What the project overview draws: who is signed in, and the rows of the list. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.template';
import type { ProjectInfo, UserInfo } from '../storage';

export const SignedIn = ({ user }: { user: UserInfo }): VNode =>
  <><span class="avatar" style="margin:0">{user.initials}</span> {user.name} <span>Sign out</span></>;

const ProjectRow = ({ project: p, open }: { project: ProjectInfo; open: (id: string) => void }): VNode =>
  <button class="pj-row" data-p={p.id} onClick={() => open(p.id)}>
    <span class="av" style={`background:var(--${p.colour})`}>{p.initials}</span>
    <span class="pj-t"><b>{p.name}</b><small>{p.about}</small><small class="mono">{p.path}</small></span>
    <span class="pj-m">
      {p.errors ? <span class="chip">{ico('error', 'c-red')}{p.errors}</span> : ''}
      <span class="chip">{ico('branch')}{p.branch}</span>
      <span class="when">{p.opened}</span>
    </span>
  </button>;

/* the rows that are shown, or why there are none; any says whether there is a project at all, and open gets the project that was clicked */
export const ProjectRows = ({ rows, any, open }: { rows: readonly ProjectInfo[]; any: boolean; open: (id: string) => void }): VNode =>
  rows.length ? <>{rows.map(p => <ProjectRow key={p.id} project={p} open={open} />)}</> : <div class="hint">{any ? 'No project matches that search.' : 'There are no projects yet.'}</div>;
