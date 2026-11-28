/* The contents list of a container. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { byId } from '../model';
import { openDoc } from '../open';
import { Contents } from './contents.template';
import type { Tool } from './shared';

/* an item's child items, or what a folder of the File System view holds */
export const rContents: Tool = (d, x) => {
  draw(d, h(Contents, { key: x.id, name: x.name, rows: x.entries ?? x.children ?? [], open: row => { const now = byId(row.id); if (now) openDoc(now); } }));
};
