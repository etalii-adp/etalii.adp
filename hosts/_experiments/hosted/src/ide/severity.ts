/* How bad the problems of an item are: its own, and those of everything under it. */
import { project } from './storage';
import type { Item, Severity } from './types';

const rank: Record<Severity, number> = { error: 2, warning: 1, info: 0 };

/* the worst of them, error or warning; notes do not count */
export function sev(x: Item): Severity | null {
  let s: Severity | null = null;
  const worse = (t: Severity | null) => { if (t && rank[t] && (!s || rank[t] > rank[s])) s = t; };
  for (const p of project.status.problems) if (p.node === x) worse(p.s);
  for (const k of x.children || []) worse(sev(k));
  return s;
}
