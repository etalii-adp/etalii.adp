/* Starts the IDE page once every other script has loaded. */
'use strict';

addEventListener('resize',()=>S.cvFit&&S.cvFit(true));

if(innerWidth<1000)S.act.right=null;if(innerWidth<700){S.act.left=null;S.act.bottom=null}
S.tabs=[ROOT,find('Meter readings to Bronze'),find('Asset model'),find('Home')];S.doc=S.sel=ROOT;

renderTitle();renderProblems();renderCommit();renderGit();layout();renderExplorer();renderProps();renderStatus();renderEditor();
pageReady();
