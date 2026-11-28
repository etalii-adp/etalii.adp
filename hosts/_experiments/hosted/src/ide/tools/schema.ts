/* Designer: data schemas, with the generated JSON Schema beside it. */
import { $$, esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { K } from '../kinds';
import { byId, ro } from '../model';
import { openDoc } from '../open';
import { repaint } from '../repaint';
import { project, storage } from '../storage';
import type { Item, SchemaDocument, SchemaSettings } from '../types';
import { hl } from './code';
import { edit, tbar, waiting, type Tool } from './shared';

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

export const rSchema: Tool = (d, x) => {
  const doc = project.content.doc<SchemaDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  const { fields, settings: sf } = doc ?? EMPTY, options = (list: string) => storage.catalogue.options(list);
  const lock = ro(x) ? ' disabled' : '', json = asJson.has(x.id), used = (doc?.usedBy ?? []).map(byId).filter((u): u is Item => !!u);
  const js = () => JSON.stringify({ title: x.name, type: 'object', required: fields.filter(f => f[2]).map(f => f[0]), properties: Object.fromEntries(fields.map(f => [f[0], { type: jsonType[f[1]] || f[1], ...(f[1] === 'datetime' ? { format: 'date-time' } : f[1] === 'date' ? { format: 'date' } : {}), ...(f[1] === 'enum' && f[3] ? { enum: f[3].split(' | ') } : f[3] ? { description: f[3] } : {}), ...(f[4] ? { 'x-ontology': f[4] } : {}) }])) }, null, 2);
  const opt = (list: readonly string[], v: string) => list.map(o => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('');
  d.innerHTML = `<div class="tool">${tbar(x, `<span>${fields.length} fields · version ${esc(sf.version)}</span><span class="sp"></span><div class="seg" id="s-view"><button data-v="designer" class="${json ? '' : 'on'}">Designer</button><button data-v="json" class="${json ? 'on' : ''}">JSON Schema</button></div>`)}${json ? `<div class="code" tabindex="0">${hl(js())}</div>` : `<div class="scroll"><div class="form" style="padding-bottom:10px"><h3>Schema</h3>
    <div class="fl"><span>Format</span><select class="in" id="s-format" data-h="format"${lock}>${opt(options('schema-formats'), sf.format)}</select></div>
    <div class="fl"><span>Version</span><input class="in" id="s-version" data-h="version" value="${esc(sf.version)}" style="max-width:120px"${lock}></div>
    <div class="fl"><span>Compatibility</span><select class="in" id="s-compat" data-h="compat"${lock}>${opt(options('schema-compatibility'), sf.compat)}</select></div>
    <div class="fl"><span>Used by</span><span class="chips">${used.map(u => `<button type="button" class="lnk" data-ent="${u.id}">${ico(u.icon || K[u.kind].icon, 'c-' + K[u.kind].colour)}${esc(u.name)}</button>`).join('') || '<span class="wait">Nothing uses this schema yet</span>'}</span></div><h3>Fields</h3></div>
   <table class="grid"><thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraint</th><th>Maps to ontology</th><th></th></tr></thead><tbody>${fields.map((f, i) => `<tr><td><input class="in mono cell" data-i="${i}" data-c="0" value="${esc(f[0])}" aria-label="Field name"${lock}></td><td><select class="in mono cell" data-i="${i}" data-c="1" aria-label="Type"${lock}>${opt(options('field-types'), f[1])}</select></td><td><input type="checkbox" data-i="${i}" data-c="2" aria-label="Required" ${f[2] ? 'checked' : ''}${lock}></td><td><input class="in cell" data-i="${i}" data-c="3" value="${esc(f[3])}" placeholder="None" aria-label="Constraint"${lock}></td><td><input class="in mono cell${mapOk(f[4]) ? '' : ' badmap'}" data-i="${i}" data-c="4" value="${esc(f[4])}" placeholder="Not mapped" aria-label="Maps to ontology" title="${esc(mapTitle(f[4]))}"${lock}></td><td>${lock ? '' : `<button class="ib" data-del="${i}" title="Remove field">${ico('x')}</button>`}</td></tr>`).join('')}</tbody></table>
   <div style="padding:8px 10px">${lock ? '' : `<button class="btn" id="s-add">${ico('plus')}Add Field</button>`}</div></div>`}</div>`;
  const change = (by: (doc: SchemaDocument) => void): Promise<unknown> => edit(x, EMPTY, by);
  d.onchange = e => {
    const t = e.target as HTMLInputElement | HTMLSelectElement, setting = t.dataset.h as keyof SchemaSettings | undefined, value = t.value;
    if (setting) { void change(s => { s.settings[setting] = value; }); return; }
    if (t.dataset.c === undefined) return;
    const at = Number(t.dataset.i), column = Number(t.dataset.c), on = (t as HTMLInputElement).checked;
    void change(s => {
      const f = s.fields[at];
      if (column === 2) f[2] = on;
      else if (column === 0 || column === 1 || column === 3 || column === 4) f[column] = value.trim();
    });
    if (column === 4) { t.classList.toggle('badmap', !mapOk(value.trim())); t.title = mapTitle(value.trim()); }
  };
  d.onclick = e => {
    const v = hit(e, '#s-view button'), dl = hit(e, '[data-del]'), en = hit(e, '[data-ent]');
    if (v) { if (v.dataset.v === 'json') asJson.add(x.id); else asJson.delete(x.id); repaint('editor'); }
    else if (dl) { const at = Number(dl.dataset.del); void change(s => { s.fields.splice(at, 1); }).then(() => repaint('editor')); }
    else if (en) { const to = byId(en.dataset.ent!); if (to) openDoc(to); }
    else if (hit(e, '#s-add')) {
      void change(s => { s.fields.push(['newField', 'string', false, '', '']); }).then(() => {
        repaint('editor');
        const added = $$<HTMLInputElement>('input[data-c="0"]', d).pop();
        added?.focus(); added?.select();
      });
    }
  };
};
