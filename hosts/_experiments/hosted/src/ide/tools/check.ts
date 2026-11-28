/* Designer: test suites and validation procedures. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { act, project } from '../storage';
import type { CheckDocument } from '../types';
import { Check } from './check.template';
import { waiting, type Tool } from './shared';

export const rCheck: Tool = (d, x) => {
  const doc = project.content.doc<CheckDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  const column = x.kind === 'testsuite' ? 'Case' : x.kind === 'evalset' ? 'Scenario' : 'Rule or step';
  draw(d, h(Check, { key: x.id, item: x, doc, column, run: () => { void act(project.status.run(x)); } }));
};
