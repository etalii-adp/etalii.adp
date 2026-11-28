/* Designer: data schemas, with the generated JSON Schema beside it. */
import { h } from 'preact';
import { $$, draw } from '../../common/dom';
import { byId, ro } from '../model';
import { openDoc } from '../open';
import { repaint } from '../repaint';
import { project, storage } from '../storage';
import type { DeepReadonly, Item, SchemaDocument, SchemaField } from '../types';
import { hl } from './code';
import { Schema } from './schema.template';
import { edit, waiting, type Tool } from './shared';

const jsonType: Record<string, string> = { int: 'integer', decimal: 'number', date: 'string', datetime: 'string', enum: 'string' };
/* a schema nothing was written of yet */
const EMPTY: SchemaDocument = { fields: [], settings: { format: 'JSON', version: '1', compat: 'Backward' } };
/* the schemas that show as their JSON Schema, for as long as the page is open */
const asJson = new Set<string>();

/* a field maps to "EntityType.attribute"; it is right when a model defines that attribute */
function mapOk(m: string): boolean {
  if (!m) return true;
  const [e, a] = m.split('.');
  for (const k of project.solution.all()) if (k.kind === 'entity' && !k.ext && k.name === e && k.attrs?.some(t => t.startsWith(a + ':'))) return true;
  return false;
}
const mapTitle = (m: string): string => mapOk(m) ? 'Entity type and attribute, such as Meter.serialNumber' : 'No ontology model defines ' + m;

/* the JSON Schema a schema stands for, as text */
const jsonSchema = (x: Item, fields: DeepReadonly<SchemaField[]>): string => JSON.stringify({ title: x.name, type: 'object', required: fields.filter(f => f[2]).map(f => f[0]), properties: Object.fromEntries(fields.map(f => [f[0], { type: jsonType[f[1]] || f[1], ...(f[1] === 'datetime' ? { format: 'date-time' } : f[1] === 'date' ? { format: 'date' } : {}), ...(f[1] === 'enum' && f[3] ? { enum: f[3].split(' | ') } : f[3] ? { description: f[3] } : {}), ...(f[4] ? { 'x-ontology': f[4] } : {}) }])) }, null, 2);

/* An edit of a field writes the document and leaves the designer as it is, with what is being typed; taking a field away or adding one draws it again. */
export const rSchema: Tool = (d, x) => {
  const doc = project.content.doc<SchemaDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  const { fields, settings } = doc ?? EMPTY, options = (list: string) => storage.catalogue.options(list);
  const change = (by: (doc: SchemaDocument) => void): Promise<unknown> => edit(x, EMPTY, by);
  draw(d, h(Schema, {
    key: x.id, item: x, fields, settings,
    json: asJson.has(x.id) ? hl(jsonSchema(x, fields)) : null,
    formats: options('schema-formats'), compatibilities: options('schema-compatibility'), types: options('field-types'),
    used: (doc?.usedBy ?? []).map(byId).filter((u): u is Item => !!u),
    locked: !!ro(x),
    on: {
      view: json => { if (json) asJson.add(x.id); else asJson.delete(x.id); repaint('editor'); },
      setting: (setting, value) => { void change(s => { s.settings[setting] = value; }); },
      text: (at, column, value) => { void change(s => { s.fields[at][column] = value; }); },
      required: (at, on) => { void change(s => { s.fields[at][2] = on; }); },
      remove: at => { void change(s => { s.fields.splice(at, 1); }).then(() => repaint('editor')); },
      add: () => {
        void change(s => { s.fields.push(['newField', 'string', false, '', '']); }).then(() => {
          repaint('editor');
          const added = $$<HTMLInputElement>('input[data-c="0"]', d).pop();
          added?.focus(); added?.select();
        });
      },
      open: item => { const to = byId(item.id); if (to) openDoc(to); },
      mark: (field, maps) => { field.classList.toggle('badmap', !mapOk(maps)); field.title = mapTitle(maps); },
    },
  }));
};
