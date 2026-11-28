/* What the Commit tool window looks like: the changed files grouped by item, each with a tick for whether it goes into the commit, and the message with its buttons. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.tsx';
import type { Change } from '../storage';
import { K } from './kinds';
import { crumbsOf } from './model';

/* what the Commit tool window asks for; a group is named by its place, and a file by its place in its group */
export interface CommitActions {
  group: (group: number, on: boolean) => void;
  file: (group: number, file: number, on: boolean) => void;
  open: (itemId: string) => void;
  message: (text: string) => void;
  commit: (push: boolean) => void;
}

/* ticked says whether a file goes into the commit; picked is how many do */
export const Commit = ({ branch, changes, ticked, picked, message, on }: {
  branch: string; changes: readonly Change[]; ticked: (itemId: string, file: string) => boolean; picked: number; message: string; on: CommitActions;
}): VNode => {
  const total = changes.reduce((a, group) => a + group.files.length, 0);
  return <>
    <div class="cm-h">{`Changes on ${branch} · ${picked} of ${total} files selected · grouped by item`}</div>
    <div class="cm-list">{total
      ? changes.map((group, i) => <>
        <label class="cm-g">
          <input type="checkbox" data-g={i} checked={group.files.every(f => ticked(group.node.id, f.f))} aria-label={group.node.name} onChange={e => on.group(i, e.currentTarget.checked)} />
          {ico(group.node.icon || K[group.node.kind].icon, 'c-' + K[group.node.kind].colour)}
          {/* the name opens the item, and does not tick the group it is the label of */}
          <span data-open={group.node.id} onClick={e => { e.preventDefault(); on.open(group.node.id); }}>{group.node.name}</span>
          <small>{crumbsOf(group.node).slice(1, -1).map(q => q.name).join(' › ')}</small>
        </label>
        {group.files.map((f, j) =>
          <label class="cm-f">
            <input type="checkbox" data-g={i} data-f={j} checked={ticked(group.node.id, f.f)} onChange={e => on.file(i, j, e.currentTarget.checked)} />
            {ico('file', 'c-muted')}
            <span class={'mono nm v' + f.s}>{f.f}</span>
          </label>)}
      </>)
      : <div class="hint">{`Nothing to commit. Your working tree matches ${branch}.`}</div>}</div>
    <div class="cm-box">
      <textarea class="in" id="cm-msg" placeholder="Commit message" aria-label="Commit message" value={message} onInput={e => on.message(e.currentTarget.value)} />
      <div class="acts">
        <button class="btn pri" id="cm-go" disabled={!picked} onClick={() => on.commit(false)}>Commit</button>
        <button class="btn" id="cm-push" disabled={!picked} onClick={() => on.commit(true)}>Commit and Push…</button>
        {/* amending is asked for each commit anew */}
        <label style="display:flex;gap:6px;align-items:center;color:var(--muted)"><input type="checkbox" id="cm-amend" checked={false} />Amend</label>
      </div>
    </div>
  </>;
};
