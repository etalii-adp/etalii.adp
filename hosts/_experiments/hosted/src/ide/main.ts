/* Starts the IDE page: wires every part, says which function draws which part, and draws them all once. */
import { addIcons } from '../common/icons';
import { pageReady } from '../common/nav';
import { startPage } from '../common/page';
import { ownTheBrowser } from './browser';
import { renderCommit } from './commit';
import { layout, mountDocks } from './docks';
import { mountDocumentArea, renderEditor } from './document-area';
import { mountExplorer, renderExplorer } from './explorer';
import { mountGit, renderGit } from './git';
import { libraryIcons } from './icon-library';
import { must, ROOT } from './model';
import { renderProblems } from './problems';
import { renderProps } from './properties';
import { paints } from './repaint';
import { S } from './state';
import { mountTitlebar, renderStatus, renderTitle } from './titlebar';

startPage();
ownTheBrowser();
addIcons(libraryIcons);
mountDocks();
mountDocumentArea();
mountExplorer();
mountGit();
mountTitlebar();
paints({ explorer: renderExplorer, editor: renderEditor, properties: renderProps, status: renderStatus, title: renderTitle, problems: renderProblems, commit: renderCommit, git: renderGit });

addEventListener('resize', () => S.cvFit?.(true));

/* a narrow window starts with fewer tool windows open */
if (innerWidth < 1000) S.act.right = null;
if (innerWidth < 700) { S.act.left = null; S.act.bottom = null; }
S.tabs = [ROOT, must('Meter readings to Bronze'), must('Asset model'), must('Home')];
S.doc = S.sel = ROOT;

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
