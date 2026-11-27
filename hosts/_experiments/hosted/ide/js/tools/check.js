/* Designer: test suites and validation procedures. */
'use strict';

function rCheck(d,x){
  const R=x.fresh?[]:CHECK[x.name]||CHECKK[x.kind],ok=R.filter(r=>r[1]==='Passed').length,col=x.kind==='testsuite'?'Case':x.kind==='evalset'?'Scenario':'Rule or step';
  d.innerHTML=`<div class="tool">${tbar(x,`<span>${ok} of ${R.length} passed · last run today 09:15 on Staging</span><span class="sp"></span><button class="btn" style="height:24px" id="c-run">${ico('play','c-green')}Run All</button>`)}<div class="scroll">${R.length?`<table class="grid"><thead><tr><th>${col}</th><th>Result</th><th>Owner</th><th>Duration</th></tr></thead><tbody>${R.map((r,i)=>`<tr><td>${esc(r[0])}</td><td><span class="pill ${r[1]==='Passed'?'ok':r[1]==='Failed'?'bad':'wait'}">${r[1]}</span></td><td>${r[2]?esc(r[2]):'<span class="bad">No owner</span>'}</td><td class="wait">${r[1]==='Not run'?'':(1.2+i*.7).toFixed(1)+' s'}</td></tr>`).join('')}</tbody></table>`:`<div class="hint">Nothing to check yet. Add the first ${col.toLowerCase()}.</div>`}</div></div>`;
  $('#c-run').onclick=()=>toast(`${x.name} queued on Staging`)}
