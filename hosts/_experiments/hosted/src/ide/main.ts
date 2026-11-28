/* Starts the IDE page: opens the storage, wires every part, says which function draws which part, and draws them all once. */
import { addIcons } from '../common/icons';
import { go, pageReady } from '../common/nav';
import { startStored } from '../common/away';
import { startPage } from '../common/page';
import { ownTheBrowser } from './browser';
import { renderCommit } from './commit';
import { layout, mountDocks } from './docks';
import { mountDocumentArea, renderEditor } from './document-area';
import { mountExplorer, renderExplorer } from './explorer';
import { mountGit, renderGit } from './git';
import { bindModel, ROOT } from './model';
import { renderProblems } from './problems';
import { renderProps } from './properties';
import { paints, repaint, repaintEverything } from './repaint';
import { bindState, keep, settle, S } from './state';
import { openStorage, project, storage } from './storage';
import { mountTitlebar, renderStatus, renderTitle } from './titlebar';

async function start(): Promise<void> {
  startPage();
  ownTheBrowser();
  /* without a project to open, the project overview is the place to be */
  if (!await openStorage()) { go('projects'); return; }
  addIcons(storage.catalogue.icons.drawings);
  bindModel();
  bindState();
  mountDocks();
  mountDocumentArea();
  mountExplorer();
  mountGit();
  mountTitlebar();
  paints({ explorer: renderExplorer, editor: renderEditor, properties: renderProps, status: renderStatus, title: renderTitle, problems: renderProblems, commit: renderCommit, git: renderGit }, keep);

  addEventListener('resize', () => S.cvFit?.(true));
  /* the window's state is kept at once when the page is left */
  addEventListener('pagehide', () => project.workbench.keepNow());
  /* what somebody else changed shows as it is now */
  storage.onForeign(() => { settle(); repaintEverything(); });
  /* a document or a file a part asked for is there: the parts that show it are drawn again */
  project.content.onArrive(() => repaint('editor', 'properties'));

  /* a narrow window starts with fewer tool windows open */
  if (innerWidth < 1000) S.act.right = null;
  if (innerWidth < 700) { S.act.left = null; S.act.bottom = null; }
  if (!S.tabs.length) S.tabs = [ROOT];

  renderTitle();
  renderProblems();
  renderCommit();
  renderGit();
  layout();
  renderExplorer();
  renderProps();
  renderStatus();
  renderEditor();
  pageReady();
}

startStored(start);
