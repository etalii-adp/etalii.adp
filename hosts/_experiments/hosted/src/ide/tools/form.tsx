/* What the designer of form-based settings looks like: sections, and in each a line per setting with the control its type gets. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.tsx';
import { K } from '../kinds';
import { slug } from '../model';
import type { DeepReadonly, FormDocument, FormField, Item } from '../types';
import { ToolBar } from './shared.tsx';

/* The control of one setting. id is what the control is called on the page; item gives the item a reference names, and open opens it. */
const Control = ({ field: f, id, locked, item, open }: { field: DeepReadonly<FormField>; id: string; locked: boolean; item: (id: string) => Item | undefined; open: (item: Item) => void }): VNode => {
  if (f[1] === 'sel') return <select class="in" id={id} value={f[2]} disabled={locked}><option>{f[2]}</option><option>Other…</option></select>;
  if (f[1] === 'area') return <textarea class="in" id={id} rows={4} disabled={locked} value={f[2]} />;
  if (f[1] === 'tog') return <span><input type="checkbox" id={id} checked={f[2]} disabled={locked} /></span>;
  if (f[1] === 'chips') return <span class="chips" id={id}>{f[2].map(s => <span class="chip">{s}</span>)}<button class="chip" type="button" data-nyi="Add">{ico('plus')}</button></span>;
  if (f[1] === 'ref') {
    const r = item(f[3]);
    return <button type="button" class="lnk" id={id} data-ref={r ? r.id : ''} onClick={() => { if (r) open(r); }}>{r ? ico(r.icon || K[r.kind].icon, 'c-' + K[r.kind].colour) : ''}{f[2]}</button>;
  }
  if (f[1] === 'secret') return <span class="mono" id={id} style="display:flex;gap:6px;align-items:center;color:var(--muted)">{ico('lock')}{f[2]}</span>;
  return <input class={'in' + (f[1] === 'mono' ? ' mono' : '')} id={id} value={f[2]} inputmode={f[1] === 'num' ? 'decimal' : undefined} style={f[1] === 'num' ? 'max-width:120px' : undefined} disabled={locked} />;
};

export const Form = ({ item, sections, locked, itemOf, open }: {
  item: Item; sections: DeepReadonly<FormDocument['sections']>; locked: boolean; itemOf: (id: string) => Item | undefined; open: (item: Item) => void;
}): VNode => {
  /* the settings are counted through the sections, so that no two controls are called the same */
  let at = 0;
  return <div class="tool">
    <ToolBar item={item} />
    <div class="scroll">
      <div class="form">{sections.map(([title, fields]) => <>
        <h3>{title}</h3>
        {fields.map(f => <div class="fl"><span>{f[0]}</span><Control field={f} id={'f' + at++ + '-' + slug(f[0])} locked={locked} item={itemOf} open={open} /></div>)}
      </>)}</div>
    </div>
  </div>;
};
