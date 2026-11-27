/* Diagram: data pipelines and release pipelines. */
import { $, $$, esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { toast } from '../../common/popups';
import { FLOW, FLOWK, type Flow, type StepType } from '../data/flows';
import { PROBLEMS } from '../data/problems';
import { K } from '../kinds';
import { inspect } from '../open';
import { ARROW, curve, tbar, type Tool } from './shared';

/* the colour of each type of step */
const TC: Record<StepType, string> = { Source: 'teal', Validate: 'yellow', Transform: 'blue', Map: 'purple', Sink: 'green', Stage: 'blue', Gate: 'orange', Deploy: 'red', Test: 'green' };

export const rFlow: Tool = (d, x) => {
  type Step = Flow['nodes'][number];
  const F: Flow = x.fresh ? { nodes: [], edges: [] } : FLOW[x.name] || FLOWK[x.kind] || { nodes: [], edges: [] }, W = 160, H = 48, SX = 200, SY = 80, M = 24, px = (o: Step) => M + o.x * SX, py = (o: Step) => M + o.y * SY;
  const w = M * 2 + W + Math.max(0, ...F.nodes.map(o => o.x)) * SX, h = M * 2 + H + Math.max(0, ...F.nodes.map(o => o.y)) * SY;
  const types: StepType[] = x.kind === 'release' ? ['Stage', 'Gate', 'Deploy', 'Test'] : ['Source', 'Transform', 'Validate', 'Map', 'Sink'];
  d.innerHTML = `<div class="tool">${tbar(x, `<span>${F.nodes.length} steps</span><span class="sp"></span><button class="btn" style="height:24px" id="f-run">${ico('play', 'c-green')}Run</button>`)}<div class="tbody"><div class="tbox"><h4>Toolbox</h4>${types.map(t => `<div><span class="sq c-${TC[t]}"></span>${t}</div>`).join('')}<small>Drag a step onto the diagram.</small></div><div class="surf" style="display:flex">${F.nodes.length ? `<div class="dg" style="width:${w}px;height:${h}px;flex:none"><svg>${ARROW}${F.edges.map(([a, b]) => `<path marker-end="url(#ar)" d="${curve(px(F.nodes[a]) + W, py(F.nodes[a]) + H / 2, px(F.nodes[b]) - 2, py(F.nodes[b]) + H / 2)}"/>`).join('')}</svg>${F.nodes.map((o, i) => `<button class="dn ${o.f || ''}" data-el="${i}" style="left:${px(o)}px;top:${py(o)}px;width:${W}px;height:${H}px"><small><span class="sq c-${TC[o.t]}"></span>${o.t}${o.f === 'err' ? ico('error', 'c-red') : ''}</small><span>${esc(o.n)}</span></button>`).join('')}</div>` : `<div class="hint">This ${K[x.kind].label.toLowerCase()} has no steps yet. Drag a step from the toolbox to start.</div>`}</div></div></div>`;
  $('#f-run').onclick = () => toast(`${x.name} started on Staging`);
  d.onclick = e => {
    const b = hit(e, '.dn');
    if (!b) return;
    $$('.dn', d).forEach(k => k.classList.toggle('on', k === b));
    const o = F.nodes[Number(b.dataset.el)];
    inspect({ icon: 'flow', title: o.n, sub: o.t + ' step', g: [['Step', [['Name', o.n], ['Type', o.t], ['In', x.name]]], ['Behaviour', [['On error', o.t === 'Gate' ? 'Stop the release' : 'Quarantine the record'], ['Retries', '3'], ['Timeout', '5 min']]], o.f === 'err' && ['Problem', [['Error', PROBLEMS.find(p => p.node === x)?.m || '', 1]]], o.f === 'new' && ['Git', [['Status', 'Added, not committed']]]] });
  };
};
