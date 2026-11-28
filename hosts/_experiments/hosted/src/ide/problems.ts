/* The Problems tool window. */
import { h } from 'preact';
import { draw } from '../common/dom';
import { body } from './docks';
import { openDoc } from './open';
import { Problems } from './problems.tsx';
import { keep, S } from './state';
import { project } from './storage';

export function renderProblems(): void {
  draw(body('problems'), h(Problems, {
    found: project.status.problems, shown: S.pf,
    toggle: s => { S.pf[s] = !S.pf[s]; renderProblems(); keep(); },
    /* the problem that is at that place now */
    open: at => { const p = project.status.problems[at]; if (p) openDoc(p.node, 'editor'); },
  }));
}
