/* What the Problems tool window looks like: a button per severity that shows or hides its problems, and the problems. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.tsx';
import { crumbsOf } from './model';
import type { Problem, Severity, SeverityFilter } from './types';

const severities: readonly Severity[] = ['error', 'warning', 'info'];
/* icon and colour of each severity */
const look: Record<Severity, [icon: string, colour: string]> = { error: ['error', 'red'], warning: ['warning', 'yellow'], info: ['info', 'blue'] };

/* shown says which severities show; a problem is named by its place among the ones that were found */
export const Problems = ({ found, shown, toggle, open }: { found: readonly Problem[]; shown: SeverityFilter; toggle: (severity: Severity) => void; open: (problem: number) => void }): VNode =>
  <>
    <div class="prb-bar">{severities.map(s =>
      <button data-s={s} class={shown[s] ? 'on' : ''} onClick={() => toggle(s)}>{ico(look[s][0], 'c-' + look[s][1])}{`${found.filter(p => p.s === s).length} ${s === 'info' ? 'notes' : s + 's'}`}</button>)}</div>
    <div class="prb">{found.map((p, i) => shown[p.s]
      ? <button data-i={i} onClick={() => open(i)}>{ico(look[p.s][0], 'c-' + look[p.s][1])}<span>{p.m}<small>{crumbsOf(p.node).slice(1).map(q => q.name).join(' › ')}</small></span></button>
      : '')}</div>
  </>;
