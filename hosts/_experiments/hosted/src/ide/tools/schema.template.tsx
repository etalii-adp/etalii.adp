/* What the designer of a data schema looks like: its settings, the items that use it, and its fields, or the JSON Schema it stands for. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.template';
import { K } from '../kinds';
import type { DeepReadonly, Item, SchemaField, SchemaSettings } from '../types';
import { ToolBar } from './shared.template';

/* the texts of a field, by their column: its name, its type, its constraint and what it maps to */
export type TextColumn = 0 | 1 | 3 | 4;
/* what the designer asks for: a field is named by its place */
export interface SchemaActions {
  view: (json: boolean) => void;
  setting: (setting: keyof SchemaSettings, value: string) => void;
  text: (at: number, column: TextColumn, value: string) => void;
  required: (at: number, on: boolean) => void;
  remove: (at: number) => void;
  add: () => void;
  open: (item: Item) => void;
  /* marks the field a mapping is typed in as right or wrong, by what it holds now */
  mark: (field: HTMLInputElement, maps: string) => void;
}

/* a list to choose from: the one that is chosen, where a value the list lacks shows as its first, and what it offers */
const chosen = (list: readonly string[], value: string): string => list.includes(value) ? value : list[0];
const offered = (list: readonly string[]): VNode[] => list.map(o => <option>{o}</option>);

/* json is the JSON Schema as the lines of the highlighter, when that is what shows; formats, compatibilities and types are what the lists offer; used are the items that use the schema */
export const Schema = ({ item, fields, settings, json, formats, compatibilities, types, used, locked, on }: {
  item: Item; fields: DeepReadonly<SchemaField[]>; settings: DeepReadonly<SchemaSettings>; json: string | null;
  formats: readonly string[]; compatibilities: readonly string[]; types: readonly string[]; used: readonly Item[]; locked: boolean; on: SchemaActions;
}): VNode =>
  <div class="tool">
    <ToolBar item={item}>
      <span>{`${fields.length} fields · version ${settings.version}`}</span>
      <span class="sp"></span>
      <div class="seg" id="s-view">
        <button data-v="designer" class={json === null ? 'on' : ''} onClick={() => on.view(false)}>Designer</button>
        <button data-v="json" class={json === null ? '' : 'on'} onClick={() => on.view(true)}>JSON Schema</button>
      </div>
    </ToolBar>
    {json !== null
      ? <div key="json" class="code" tabindex={0} dangerouslySetInnerHTML={{ __html: json }} />
      : <div key="designer" class="scroll">
        <div class="form" style="padding-bottom:10px">
          <h3>Schema</h3>
          <div class="fl"><span>Format</span><select class="in" id="s-format" data-h="format" value={chosen(formats, settings.format)} disabled={locked} onChange={e => on.setting('format', e.currentTarget.value)}>{offered(formats)}</select></div>
          <div class="fl"><span>Version</span><input class="in" id="s-version" data-h="version" value={settings.version} style="max-width:120px" disabled={locked} onChange={e => on.setting('version', e.currentTarget.value)} /></div>
          <div class="fl"><span>Compatibility</span><select class="in" id="s-compat" data-h="compat" value={chosen(compatibilities, settings.compat)} disabled={locked} onChange={e => on.setting('compat', e.currentTarget.value)}>{offered(compatibilities)}</select></div>
          <div class="fl">
            <span>Used by</span>
            <span class="chips">{used.length
              ? used.map(u => <button type="button" class="lnk" data-ent={u.id} onClick={() => on.open(u)}>{ico(u.icon || K[u.kind].icon, 'c-' + K[u.kind].colour)}{u.name}</button>)
              : <span class="wait">Nothing uses this schema yet</span>}</span>
          </div>
          <h3>Fields</h3>
        </div>
        <table class="grid">
          <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraint</th><th>Maps to ontology</th><th></th></tr></thead>
          {/* with a field more or less, every row is made anew: what had the focus is gone with its row, and is not the same control of another field */}
          <tbody key={fields.length}>{fields.map((f, i) =>
            <tr>
              <td><input class="in mono cell" data-i={i} data-c="0" value={f[0]} aria-label="Field name" disabled={locked} onChange={e => on.text(i, 0, e.currentTarget.value.trim())} /></td>
              <td><select class="in mono cell" data-i={i} data-c="1" aria-label="Type" value={chosen(types, f[1])} disabled={locked} onChange={e => on.text(i, 1, e.currentTarget.value.trim())}>{offered(types)}</select></td>
              <td><input type="checkbox" data-i={i} data-c="2" aria-label="Required" checked={f[2]} disabled={locked} onChange={e => on.required(i, e.currentTarget.checked)} /></td>
              <td><input class="in cell" data-i={i} data-c="3" value={f[3]} placeholder="None" aria-label="Constraint" disabled={locked} onChange={e => on.text(i, 3, e.currentTarget.value.trim())} /></td>
              {/* whether the mapping is right shows on the field itself and follows what is typed, so it is marked on the element each time it is drawn and not through its class here */}
              <td><input class="in mono cell" data-i={i} data-c="4" value={f[4]} placeholder="Not mapped" aria-label="Maps to ontology" disabled={locked} ref={field => { if (field) on.mark(field, f[4]); }}
                onChange={e => { const maps = e.currentTarget.value.trim(); on.text(i, 4, maps); on.mark(e.currentTarget, maps); }} /></td>
              <td>{locked ? '' : <button class="ib" data-del={i} title="Remove field" onClick={() => on.remove(i)}>{ico('x')}</button>}</td>
            </tr>)}</tbody>
        </table>
        <div style="padding:8px 10px">{locked ? '' : <button class="btn" id="s-add" onClick={on.add}>{ico('plus')}Add Field</button>}</div>
      </div>}
  </div>;
