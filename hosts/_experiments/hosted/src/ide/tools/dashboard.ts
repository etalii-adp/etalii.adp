/* Designer: analysis views. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { project } from '../storage';
import type { DashboardDocument } from '../types';
import { Dashboard } from './dashboard.tsx';
import { waiting, type Tool } from './shared';

export const rDash: Tool = (d, x) => {
  const doc = project.content.doc<DashboardDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  draw(d, h(Dashboard, { key: x.id, item: x, doc }));
};
