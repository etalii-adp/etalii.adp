/* What the designer of one entity type looks like: its attributes, each with a name, a data type and whether it is required, and the relations it takes part in. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.tsx';
import type { Item, Relation } from '../types';
import { ToolBar } from './shared.tsx';

/* an attribute as the designer shows it */
export interface Attribute { name: string; type: string; required: boolean }
/* what the designer asks for: an attribute is named by its place */
export interface EntityActions {
  name: (at: number, name: string) => void;
  type: (at: number, type: string) => void;
  required: (at: number, on: boolean) => void;
  remove: (at: number) => void;
  add: () => void;
  open: (item: Item) => void;
  diagram: () => void;
}

/* model is the model the entity type is in; types are the data types an attribute can have; locked says that nothing can be changed, and original is the entity type a reference stands for */
export const Entity = ({ item, model, attributes, types, locked, original, relations, on }: {
  item: Item; model: Item; attributes: readonly Attribute[]; types: readonly string[]; locked: boolean; original: Item | undefined; relations: readonly Relation[]; on: EntityActions;
}): VNode =>
  <div class="tool">
    <ToolBar item={item}>
      <span>{`${attributes.length} attributes · in ${model.name}`}</span>
      {item.ext ? <span class="chip">{ico('link')}{`Reference to ${item.ext}`}</span> : ''}
      <span class="sp"></span>
      <button class="btn" style="height:24px" id="e-dia" onClick={on.diagram}>{ico('graph', 'c-purple')}Show in Diagram</button>
    </ToolBar>
    <div class="scroll">
      <table class="grid">
        <thead><tr><th>Attribute</th><th>Data type</th><th>Required</th><th></th></tr></thead>
        {/* with an attribute more or less, every row is made anew: what had the focus is gone with its row, and is not the same control of another attribute */}
        <tbody key={attributes.length}>{attributes.map((a, i) =>
          <tr>
            <td><input class="in mono cell" data-i={i} data-f="n" value={a.name} aria-label="Attribute name" disabled={locked} onChange={e => on.name(i, e.currentTarget.value)} /></td>
            <td><select class="in mono cell" data-i={i} data-f="t" aria-label="Data type" value={a.type} disabled={locked} onChange={e => on.type(i, e.currentTarget.value)}>{[...new Set([a.type, ...types])].map(o => <option>{o}</option>)}</select></td>
            <td><input type="checkbox" data-i={i} data-f="r" aria-label="Required" checked={a.required} disabled={locked} onChange={e => on.required(i, e.currentTarget.checked)} /></td>
            <td>{locked ? '' : <button class="ib" data-del={i} title="Remove attribute" onClick={() => on.remove(i)}>{ico('x')}</button>}</td>
          </tr>)}</tbody>
      </table>
      <div style="padding:8px 10px">
        {locked
          ? (original ? <button class="lnk" data-ent={original.id} onClick={() => on.open(original)}>{ico('shapes', 'c-purple')}{`Open ${item.name} in ${item.ext}`}</button> : '')
          : <button class="btn" id="e-add" onClick={on.add}>{ico('plus')}Add Attribute</button>}
      </div>
      {relations.length
        ? <table class="grid">
          <thead><tr><th>Relation</th><th>From</th><th>To</th></tr></thead>
          <tbody>{relations.map(r =>
            <tr>
              <td class="mono">{r[2]}</td>
              {[r[0], r[1]].map(e => <td><button class="lnk" data-ent={e.id} onClick={() => on.open(e)}>{ico(e.icon || 'shapes', 'c-purple')}{e.name}</button></td>)}
            </tr>)}</tbody>
        </table>
        : ''}
    </div>
  </div>;
