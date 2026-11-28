/* What the diagram of a data pipeline or a release pipeline looks like: a toolbox, and the steps with the lines between them. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.tsx';
import { K } from '../kinds';
import type { DeepReadonly, FlowDocument, Item, StepType } from '../types';
import { curve } from './shared';
import { Arrow, ToolBar } from './shared.tsx';

/* the colour of each type of step */
const TC: Record<StepType, string> = { Source: 'teal', Validate: 'yellow', Transform: 'blue', Map: 'purple', Sink: 'green', Stage: 'blue', Gate: 'orange', Deploy: 'red', Test: 'green' };
const W = 160, H = 48, SX = 200, SY = 80, M = 24;

/* types are the steps the toolbox offers; picked is the step that was clicked, by its place, and pick gets the one that is */
export const Flow = ({ item, doc, types, picked, run, pick }: { item: Item; doc: DeepReadonly<FlowDocument> | null; types: readonly StepType[]; picked: number; run: () => void; pick: (step: number) => void }): VNode => {
  const F = doc ?? { nodes: [], edges: [] }, px = (o: { x: number }) => M + o.x * SX, py = (o: { y: number }) => M + o.y * SY;
  const w = M * 2 + W + Math.max(0, ...F.nodes.map(o => o.x)) * SX, h = M * 2 + H + Math.max(0, ...F.nodes.map(o => o.y)) * SY;
  return <div class="tool">
    <ToolBar item={item}>
      <span>{`${F.nodes.length} steps`}</span>
      <span class="sp"></span>
      <button class="btn" style="height:24px" id="f-run" onClick={run}>{ico('play', 'c-green')}Run</button>
    </ToolBar>
    <div class="tbody">
      <div class="tbox"><h4>Toolbox</h4>{types.map(t => <div><span class={'sq c-' + TC[t]}></span>{t}</div>)}<small>Drag a step onto the diagram.</small></div>
      <div class="surf" style="display:flex">
        {F.nodes.length
          ? <div class="dg" style={`width:${w}px;height:${h}px;flex:none`}>
            <svg><Arrow />{F.edges.map(([a, b]) => <path marker-end="url(#ar)" d={curve(px(F.nodes[a]) + W, py(F.nodes[a]) + H / 2, px(F.nodes[b]) - 2, py(F.nodes[b]) + H / 2)} />)}</svg>
            {F.nodes.map((o, i) =>
              <button class={'dn' + (o.f ? ' ' + o.f : '') + (i === picked ? ' on' : '')} data-el={i} style={`left:${px(o)}px;top:${py(o)}px;width:${W}px;height:${H}px`} onClick={() => pick(i)}>
                <small><span class={'sq c-' + TC[o.t]}></span>{o.t}{o.f === 'err' ? ico('error', 'c-red') : ''}</small>
                <span>{o.n}</span>
              </button>)}
          </div>
          : <div class="hint">{`This ${K[item.kind].label.toLowerCase()} has no steps yet. Drag a step from the toolbox to start.`}</div>}
      </div>
    </div>
  </div>;
};
