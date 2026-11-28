/* What the diagram of an ontology model looks like: a toolbox, and the entity types with the relations between them. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.tsx';
import type { Item, Point, Relation } from '../types';
import { Arrow, ToolBar } from './shared.tsx';

const W = 170, M = 24;
/* how high the box of an entity type is: its name, and a line for each attribute */
export const heightOf = (e: Item): number => 38 + (e.attrs?.length ?? 0) * 19;

/* the line of a relation, from the side of one box to the side of the other, with its label in the middle */
const Line = ({ relation: [A, B, label], at }: { relation: Relation; at: (e: Item) => Point }): VNode => {
  const ax = M + at(A).x, ay = M + at(A).y, bx = M + at(B).x, by = M + at(B).y, dx = bx - ax, dy = by - ay;
  let p: [number, number], q: [number, number];
  if (Math.abs(dx) > Math.abs(dy)) { p = [ax + (dx > 0 ? W : 0), ay + heightOf(A) / 2]; q = [bx + (dx > 0 ? -2 : W + 2), by + heightOf(B) / 2]; }
  else { p = [ax + W / 2, ay + (dy > 0 ? heightOf(A) : 0)]; q = [bx + W / 2, by + (dy > 0 ? -2 : heightOf(B) + 2)]; }
  return <>
    <line marker-end="url(#ar)" x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />
    <text x={(p[0] + q[0]) / 2} y={(p[1] + q[1]) / 2 - 5} text-anchor="middle">{label}</text>
  </>;
};

/* at says where an entity type stands; marked is the one that is marked, by its id; pick gets the one that was clicked, and open the one that was clicked twice */
export const Ontology = ({ item, entities, relations, at, marked, pick, open }: {
  item: Item; entities: readonly Item[]; relations: readonly Relation[]; at: (e: Item) => Point; marked: string | null; pick: (e: Item) => void; open: (e: Item) => void;
}): VNode => {
  const w = M * 2 + W + Math.max(0, ...entities.map(e => at(e).x)), h = M * 2 + Math.max(0, ...entities.map(e => at(e).y + heightOf(e)));
  return <div class="tool">
    <ToolBar item={item}><span>{`${entities.length} entity types, ${relations.length} relations`}</span></ToolBar>
    <div class="tbody">
      <div class="tbox">
        <h4>Toolbox</h4>
        <div><span class="sq c-purple"></span>Entity type</div>
        <div><span class="sq c-blue"></span>Relation</div>
        <div><span class="sq c-yellow"></span>Attribute</div>
        <div><span class="sq c-muted"></span>Reference</div>
        <small>Dashed entity types come from another model. Double-click one to edit its attributes.</small>
      </div>
      <div class="surf" style="display:flex">
        {entities.length
          ? <div class="dg" style={`width:${w}px;height:${h}px;flex:none`}>
            <svg><Arrow />{relations.map(r => <Line relation={r} at={at} />)}</svg>
            {entities.map(e =>
              <button key={e.id} class={'en' + (e.ext ? ' ext' : '') + (marked === e.id ? ' on' : '')} data-id={e.id} style={`left:${M + at(e).x}px;top:${M + at(e).y}px;height:${heightOf(e)}px`} onClick={() => pick(e)} onDblClick={() => open(e)}>
                <b>{ico(e.icon || 'shapes', 'c-purple')}{e.name}</b>
                {(e.attrs || []).map(a => <i>{a}</i>)}
              </button>)}
          </div>
          : <div class="hint">{`No entity types yet. Right-click ${item.name} in the Explorer and choose New, or drag one from the toolbox.`}</div>}
      </div>
    </div>
  </div>;
};
