/* The Commit tool window. */
import { h } from 'preact';
import { $, draw } from '../common/dom';
import { Commit } from './commit.tsx';
import { body } from './docks';
import { byId } from './model';
import { openDoc } from './open';
import { repaint, repaintAll } from './repaint';
import { keep, S } from './state';
import { act, project } from './storage';

/* the files a person took out of a commit, by item and file; every other changed file is in the next one, and these stay out until they are ticked again */
const left = new Set<string>();
const key = (itemId: string, file: string): string => itemId + '/' + file;

export function renderCommit(): void {
  const b = body('commit'), git = project.git, CH = git.changes, ticked = (itemId: string, file: string): boolean => !left.has(key(itemId, file));
  const picked = CH.flatMap(group => group.files.filter(f => ticked(group.node.id, f.f)).map(f => ({ node: group.node, f: f.f })));
  const message = (): HTMLTextAreaElement => $<HTMLTextAreaElement>('#cm-msg', b);
  /* ticks files in or out of the commit, and shows what that leaves */
  const tick = (itemId: string, files: readonly { readonly f: string }[], on: boolean): void => {
    for (const f of files) { if (on) left.delete(key(itemId, f.f)); else left.add(key(itemId, f.f)); }
    S.cmsg = message().value;
    renderCommit();
    keep();
  };
  const commit = async (push: boolean): Promise<void> => {
    const field = message();
    if (!field.value.trim()) field.focus();
    if (!await act(project.git.commit(field.value, picked, push))) return;
    S.cmsg = '';
    renderCommit();
    repaint('git');
    repaintAll();
    repaint('title');
  };
  draw(b, h(Commit, {
    branch: git.branch, changes: CH, ticked, picked: picked.length, message: S.cmsg ?? git.suggestedMessage,
    on: {
      group: (group, on) => tick(CH[group].node.id, CH[group].files, on),
      file: (group, file, on) => tick(CH[group].node.id, [CH[group].files[file]], on),
      open: itemId => { const x = byId(itemId); if (x) openDoc(x); },
      message: text => { S.cmsg = text; keep(); },
      commit: push => void commit(push),
    },
  }));
}
