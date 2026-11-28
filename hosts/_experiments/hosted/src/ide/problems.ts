/* The Problems tool window. */
import { esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { body } from './docks';
import { crumbsOf } from './model';
import { openDoc } from './open';
import { keep, S } from './state';
import { project } from './storage';
import type { Severity } from './types';

const severities: readonly Severity[] = ['error', 'warning', 'info'];
/* icon and colour of each severity */
const look: Record<Severity, [icon: string, colour: string]> = { error: ['error', 'red'], warning: ['warning', 'yellow'], info: ['info', 'blue'] };

export function renderProblems(): void {
  const b = body('problems'), found = project.status.problems, cnt = (s: Severity) => found.filter(p => p.s === s).length;
  b.innerHTML = `<div class="prb-bar">${severities.map(s => `<button data-s="${s}" class="${S.pf[s] ? 'on' : ''}">${ico(look[s][0], 'c-' + look[s][1])}${cnt(s)} ${s === 'info' ? 'notes' : s + 's'}</button>`).join('')}</div><div class="prb">${found.map((p, i) => S.pf[p.s] ? `<button data-i="${i}">${ico(look[p.s][0], 'c-' + look[p.s][1])}<span>${esc(p.m)}<small>${crumbsOf(p.node).slice(1).map(q => esc(q.name)).join(' › ')}</small></span></button>` : '').join('')}</div>`;
  b.onclick = e => {
    const f = hit(e, '[data-s]');
    if (f) { const s = f.dataset.s as Severity; S.pf[s] = !S.pf[s]; renderProblems(); keep(); return; }
    const r = hit(e, '[data-i]'), p = r && project.status.problems[Number(r.dataset.i)];
    if (p) openDoc(p.node, 'editor');
  };
}
