/* The project overview: search, the two lists, and opening a project. */
'use strict';

let PF='all';
function renderProjects(){const q=$('#pj-q').value.trim().toLowerCase(),rows=PROJ.filter(p=>(PF==='all'||p[7])&&(!q||p[0].toLowerCase().includes(q)));
  $('#pj-n1').textContent=PROJ.length;$('#pj-n2').textContent=PROJ.filter(p=>p[7]).length;$$('[data-pf]').forEach(b=>b.classList.toggle('on',b.dataset.pf===PF));
  $('#pj-list').innerHTML=rows.map(p=>`<button class="pj-row" data-p="${p[0]}"><span class="av" style="background:var(--${p[2]})">${p[1]}</span><span class="pj-t"><b>${p[0]}</b><small>${p[5]}</small><small class="mono">${p[3]}</small></span><span class="pj-m">${p[0]==='Atlas Platform'?`<span class="chip">${ico('error','c-red')}2</span>`:''}<span class="chip">${ico('branch')}${p[4]}</span><span class="when">${p[6]}</span></span></button>`).join('')||'<div class="hint">No project matches that search.</div>'}
$('#pj-q').oninput=renderProjects;
$('#pj-list').onclick=e=>{const r=e.target.closest('[data-p]');if(!r)return;r.dataset.p==='Atlas Platform'?go('ide'):only()};

document.addEventListener('click',e=>{const f=e.target.closest('[data-pf]');if(f){PF=f.dataset.pf;renderProjects()}});
renderProjects();
pageReady();
