/* The Problems tool window. */
'use strict';

function renderProblems(){const b=body('problems'),cnt=s=>PROBLEMS.filter(p=>p.s===s).length,ic={error:['error','red'],warning:['warning','yellow'],info:['info','blue']};
  b.innerHTML=`<div class="prb-bar">${['error','warning','info'].map(s=>`<button data-s="${s}" class="${S.pf[s]?'on':''}">${ico(ic[s][0],'c-'+ic[s][1])}${cnt(s)} ${s==='info'?'notes':s+'s'}</button>`).join('')}</div><div class="prb">${PROBLEMS.map((p,i)=>S.pf[p.s]?`<button data-i="${i}">${ico(ic[p.s][0],'c-'+ic[p.s][1])}<span>${esc(p.m)}<small>${crumbsOf(p.node).slice(1).map(q=>esc(q.name)).join(' › ')}</small></span></button>`:'').join('')}</div>`;
  b.onclick=e=>{const f=e.target.closest('[data-s]');if(f){S.pf[f.dataset.s]=!S.pf[f.dataset.s];return renderProblems()}const r=e.target.closest('[data-i]');if(r)openDoc(PROBLEMS[r.dataset.i].node,'editor')}}
