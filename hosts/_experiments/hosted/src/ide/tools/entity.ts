/* Designer: one entity type of an ontology model, with its attributes and relations. What it holds is part of its model's document, so an edit here writes that document. */
import { h } from 'preact';
import { $$, draw } from '../../common/dom';
import { byId, modelNamed, ro } from '../model';
import { openDoc, pick } from '../open';
import { repaint } from '../repaint';
import { storage } from '../storage';
import type { Item, OntologyDocument } from '../types';
import { Entity } from './entity.template';
import { markEntity } from './ontology';
import { edit, type Tool } from './shared';

/* an attribute is kept as "name: type" */
const splitAttr = (a: string): [name: string, type: string] => { const i = a.indexOf(': '); return i < 0 ? [a, 'text'] : [a.slice(0, i), a.slice(i + 2)]; };

type Held = { attrs: string[]; req: boolean[] };
/* changes what an entity type holds, in its model's document */
const change = (x: Item, by: (held: Held) => void): Promise<unknown> => edit<OntologyDocument>(x, { entities: {}, relations: [] }, doc => {
  const e = doc.entities[x.id] ??= { attrs: [] }, held: Held = { attrs: e.attrs, req: e.req ?? e.attrs.map((_, i) => i < 2) };
  by(held);
  e.attrs = held.attrs; e.req = held.req;
}, x.parent!);

/* An edit of a field writes the document and leaves the designer as it is, with what is being typed; taking an attribute away or adding one draws it again. */
export const rEntity: Tool = (d, x) => {
  const O = x.parent!, siblings = O.children || [], attrs = x.attrs ?? [], req = x.req ?? attrs.map((_, i) => i < 2);
  const src = x.ext ? modelNamed(x.ext) : undefined;
  draw(d, h(Entity, {
    key: x.id, item: x, model: O,
    attributes: attrs.map((a, i) => { const [name, type] = splitAttr(a); return { name, type, required: !!req[i] }; }),
    types: storage.catalogue.options('attribute-types'),
    locked: !!ro(x) || !!x.ext,
    original: src && (src.children || []).find(k => k.name === x.name && !k.ext),
    relations: (O.rels || []).filter(r => (r[0] === x || r[1] === x) && siblings.includes(r[0]) && siblings.includes(r[1])),
    on: {
      name: (at, name) => { void change(x, held => { const [was, type] = splitAttr(held.attrs[at]); held.attrs[at] = (name.trim() || was) + ': ' + type; }); },
      type: (at, type) => { void change(x, held => { held.attrs[at] = splitAttr(held.attrs[at])[0] + ': ' + type; }); },
      required: (at, on) => { void change(x, held => { held.req[at] = on; }); },
      remove: at => { void change(x, held => { held.attrs.splice(at, 1); held.req.splice(at, 1); }).then(() => repaint('editor')); },
      add: () => {
        void change(x, held => { held.attrs.push('newAttribute: text'); held.req.push(false); }).then(() => {
          repaint('editor');
          const added = $$<HTMLInputElement>('input[data-f="n"]', d).pop();
          added?.focus(); added?.select();
        });
      },
      open: item => { const to = byId(item.id); if (to) openDoc(to); },
      diagram: () => { openDoc(O, 'editor'); pick(x); markEntity(d, x); },
    },
  }));
};
