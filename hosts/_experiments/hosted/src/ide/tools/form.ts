/* Designer: form-based settings (data sources, models, agents, environments, themes, components). */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { byId, ro } from '../model';
import { openDoc } from '../open';
import { project } from '../storage';
import type { DeepReadonly, FormDocument } from '../types';
import { Form } from './form.template';
import { waiting, type Tool } from './shared';

export const rForm: Tool = (d, x) => {
  const doc = project.content.doc<FormDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  /* an item nothing was written of yet has its name to set, and no more */
  const sections: DeepReadonly<FormDocument['sections']> = doc?.sections ?? [['General', [['Name', 'text', x.name]]]];
  draw(d, h(Form, { key: x.id, item: x, sections, locked: !!ro(x), itemOf: byId, open: openDoc }));
};
