/* The Commit tool window. */
import { $, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { toast } from '../common/popups';
import { CH } from './data/changes';
import { COMMITS, HEADS, WHO } from './data/commits';
import { body } from './docks';
import { gitHash } from './git';
import { K } from './kinds';
import { BY, crumbsOf } from './model';
import { openDoc } from './open';
import { repaint, repaintAll } from './repaint';
import { S } from './state';

export function renderCommit(): void {
  const b = body('commit'), tot = CH.reduce((a, group) => a + group.files.length, 0), on = CH.reduce((a, group) => a + group.files.filter(f => f.on).length, 0);
  b.innerHTML = `<div class="cm-h">Changes on develop · ${on} of ${tot} files selected · grouped by item</div><div class="cm-list">${tot ? CH.map((group, i) => group.files.length ? `<label class="cm-g"><input type="checkbox" data-g="${i}" ${group.files.every(f => f.on) ? 'checked' : ''} aria-label="${esc(group.node.name)}">${ico(group.node.icon || K[group.node.kind].icon, 'c-' + K[group.node.kind].colour)}<span data-open="${group.node.id}">${esc(group.node.name)}</span><small>${crumbsOf(group.node).slice(1, -1).map(q => esc(q.name)).join(' › ')}</small></label>${group.files.map((f, j) => `<label class="cm-f"><input type="checkbox" data-g="${i}" data-f="${j}" ${f.on ? 'checked' : ''}>${ico('file', 'c-muted')}<span class="mono nm v${f.s}">${esc(f.f)}</span></label>`).join('')}` : '').join('') : '<div class="hint">Nothing to commit. Your working tree matches develop.</div>'}</div>
   <div class="cm-box"><textarea class="in" id="cm-msg" placeholder="Commit message" aria-label="Commit message">${esc(S.cmsg ?? 'Add tariff classes and the outage map page')}</textarea><div class="acts"><button class="btn pri" id="cm-go" ${on ? '' : 'disabled'}>Commit</button><button class="btn" id="cm-push" ${on ? '' : 'disabled'}>Commit and Push…</button><label style="display:flex;gap:6px;align-items:center;color:var(--muted)"><input type="checkbox" id="cm-amend">Amend</label></div></div>`;
  const message = $<HTMLTextAreaElement>('#cm-msg', b);
  b.onchange = e => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.g === undefined) return;
    const group = CH[Number(t.dataset.g)];
    if (t.dataset.f !== undefined) group.files[Number(t.dataset.f)].on = t.checked; else group.files.forEach(f => { f.on = t.checked; });
    S.cmsg = message.value;
    renderCommit();
  };
  b.onclick = e => { const o = hit(e, '[data-open]'); if (o) { e.preventDefault(); openDoc(BY[o.dataset.open!]); } };
  const commit = (push: boolean): void => {
    const msg = message.value.trim();
    if (!msg) { toast('Write a commit message first.'); message.focus(); return; }
    CH.forEach(group => { group.files = group.files.filter(f => !f.on); if (!group.files.length && group.node.vcs) delete group.node.vcs; });
    /* the new commit goes on top of the log, so every index in it moves down by one */
    COMMITS.forEach(cm => { cm.p = cm.p.map(i => i + 1); });
    for (const k in HEADS) HEADS[k]++;
    COMMITS.unshift({ h: gitHash(), l: 0, p: [1], m: msg, a: WHO[0], w: 'Just now', d: 0 });
    HEADS.develop = 0;
    S.ahead++;
    S.cmsg = '';
    if (push) { HEADS['origin/develop'] = 0; S.ahead = 0; }
    renderCommit();
    repaint('git');
    repaintAll();
    repaint('title');
    toast(`Committed ${on} files to develop${push ? ' and pushed to origin' : ''}`);
  };
  $('#cm-go', b).onclick = () => commit(false);
  $('#cm-push', b).onclick = () => commit(true);
}
