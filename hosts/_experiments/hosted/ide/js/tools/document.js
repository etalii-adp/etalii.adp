/* Editor: documentation, Markdown shown as rich text. */
'use strict';

function rDoc(d,x){const body=x.fresh?`<h1>${esc(x.name)}</h1><p style="color:var(--dim)">Start writing…</p>`:DOC[x.name]||`<h1>${esc(x.name)}</h1><p>This ${x.parent.name==='Runbooks'?'runbook':'document'} belongs to ${esc(x.parent.name)} in Atlas Platform.</p><h2>${x.parent.name==='Runbooks'?'First response':'Summary'}</h2><ul><li>Check the Data quality monitor for the affected source.</li><li>Open the pipeline in its diagram and look for a step marked in red.</li><li>Re-run the pipeline on Staging before touching Production.</li></ul><h2>Who to call</h2><p>Grid data team during office hours, the operations rota outside them.</p>`;
  d.innerHTML=`<div class="tool">${tbar(x,`<span>Markdown, shown as rich text</span>`)}<div class="scroll"><article class="prose">${body}</article></div></div>`}
