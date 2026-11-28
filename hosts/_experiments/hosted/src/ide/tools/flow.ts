/* Diagram: data pipelines and release pipelines. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { inspect } from '../open';
import { act, project } from '../storage';
import type { FlowDocument, Item, StepType } from '../types';
import { Flow } from './flow.template';
import { waiting, type Tool } from './shared';

/* the step that was clicked, by its place; a diagram that is drawn afresh starts with none */
let picked = -1;

function paint(d: HTMLElement, x: Item): void {
  const doc = project.content.doc<FlowDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  const types: StepType[] = x.kind === 'release' ? ['Stage', 'Gate', 'Deploy', 'Test'] : ['Source', 'Transform', 'Validate', 'Map', 'Sink'];
  /* a click on a step marks it and shows it in the Properties */
  const pick = (step: number): void => {
    const o = doc?.nodes[step];
    if (!o) return;
    picked = step;
    paint(d, x);
    inspect({ icon: 'flow', title: o.n, sub: o.t + ' step', g: [['Step', [['Name', o.n], ['Type', o.t], ['In', x.name]]], ['Behaviour', [['On error', o.t === 'Gate' ? 'Stop the release' : 'Quarantine the record'], ['Retries', '3'], ['Timeout', '5 min']]], o.f === 'err' && ['Problem', [['Error', project.status.problems.find(p => p.node === x)?.m || '', 1]]], o.f === 'new' && ['Git', [['Status', 'Added, not committed']]]] });
  };
  draw(d, h(Flow, { key: x.id, item: x, doc, types, picked, run: () => { void act(project.status.run(x)); }, pick }));
}

export const rFlow: Tool = (d, x) => { picked = -1; paint(d, x); };
