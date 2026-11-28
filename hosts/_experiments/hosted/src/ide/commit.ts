/* The Commit tool window. */
import { $, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { body } from './docks';
import { K } from './kinds';
import { byId, crumbsOf } from './model';
import { openDoc } from './open';
import { repaint, repaintAll } from './repaint';
import { keep, S } from './state';
import { act, project } from './storage';

/* the files a person took out of a commit, by item and file; every other changed file is in the next one, and these stay out until they are ticked again */
const left = new Set<string>();
const key = (itemId: string, file: string): string => itemId + '/' + file;

export function renderCommit(): void {
  const b = body('commit'), git = project.git, CH = git.changes, on = (itemId: string, file: string): boolean => !left.has(key(itemId, file));
  const tot = CH.reduce((a, group) => a + group.files.length, 0), picked = CH.flatMap(group => group.files.filter(f => on(group.node.id, f.f)).map(f => ({ node: group.node, f: f.f })));
  b.innerHTML = `<div class="cm-h">Changes on ${esc(git.branch)} · ${picked.length} of ${tot} files selected · grouped by item</div><div class="cm-list">${tot ? CH.map((group, i) => `<label class="cm-g"><input type="checkbox" data-g="${i}" ${group.files.every(f => on(group.node.id, f.f)) ? 'checked' : ''} aria-label="${esc(group.node.name)}">${ico(group.node.icon || K[group.node.kind].icon, 'c-' + K[group.node.kind].colour)}<span data-open="${group.node.id}">${esc(group.node.name)}</span><small>${crumbsOf(group.node).slice(1, -1).map(q => esc(q.name)).join(' › ')}</small></label>${group.files.map((f, j) => `<label class="cm-f"><input type="checkbox" data-g="${i}" data-f="${j}" ${on(group.node.id, f.f) ? 'checked' : ''}>${ico('file', 'c-muted')}<span class="mono nm v${f.s}">${esc(f.f)}</span></label>`).join('')}`).join('') : `<div class="hint">Nothing to commit. Your working tree matches ${esc(git.branch)}.</div>`}</div>
   <div class="cm-box"><textarea class="in" id="cm-msg" placeholder="Commit message" aria-label="Commit message">${esc(S.cmsg ?? git.suggestedMessage)}</textarea><div class="acts"><button class="btn pri" id="cm-go" ${picked.length ? '' : 'disabled'}>Commit</button><button class="btn" id="cm-push" ${picked.length ? '' : 'disabled'}>Commit and Push…</button><label style="display:flex;gap:6px;align-items:center;color:var(--muted)"><input type="checkbox" id="cm-amend">Amend</label></div></div>`;
  const message = $<HTMLTextAreaElement>('#cm-msg', b);
  message.oninput = () => { S.cmsg = message.value; keep(); };
  b.onchange = e => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.g === undefined) return;
    const group = CH[Number(t.dataset.g)];
    for (const f of t.dataset.f !== undefined ? [group.files[Number(t.dataset.f)]] : group.files) { if (t.checked) left.delete(key(group.node.id, f.f)); else left.add(key(group.node.id, f.f)); }
    S.cmsg = message.value;
    renderCommit();
    keep();
  };
  b.onclick = e => { const o = hit(e, '[data-open]'), x = o && byId(o.dataset.open!); if (x) { e.preventDefault(); openDoc(x); } };
  const commit = async (push: boolean): Promise<void> => {
    if (!message.value.trim()) message.focus();
    if (!await act(project.git.commit(message.value, picked, push))) return;
    S.cmsg = '';
    renderCommit();
    repaint('git');
    repaintAll();
    repaint('title');
  };
  $('#cm-go', b).onclick = () => void commit(false);
  $('#cm-push', b).onclick = () => void commit(true);
}
