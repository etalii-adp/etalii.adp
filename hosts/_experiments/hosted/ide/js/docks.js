/* Docks and tool windows: every panel can be shown, hidden and moved to another dock. */
'use strict';

const PAN={explorer:['Explorer','folder'],commit:['Commit','commit'],properties:['Properties','props'],problems:['Problems','warning'],git:['Git','branch']};
const pel={};
for(const id in PAN){pel[id]=el(`<section class="panel" data-panel="${id}"><header class="ph"><b>${PAN[id][0]}</b><span data-pa style="display:flex;gap:2px"></span><button class="ib" data-pm title="Move or hide this tool window">${ico('more')}</button><button class="ib" data-hide title="Hide">${ico('minus')}</button></header><div class="pb"></div></section>`);
  $('[data-hide]',pel[id]).onclick=()=>toggle(id);
  $('[data-pm]',pel[id]).onclick=e=>{const r=e.currentTarget.getBoundingClientRect();menu([{h:'Move '+PAN[id][0]+' to'},...['left','right','bottom'].map(d=>({l:d[0].toUpperCase()+d.slice(1),chk:S.dock[id]===d,on:()=>move(id,d)})),'-',{l:'Hide',on:()=>toggle(id)}],r.left-120,r.bottom+3)}}
for(const id in PAN)$('#dock-'+S.dock[id]).append(pel[id]);
const body=id=>$('.pb',pel[id]);
function layout(){
  for(const d of['left','right','bottom']){$('#dock-'+d).hidden=!S.act[d];$(`[data-split="${d}"]`).hidden=!S.act[d]}
  for(const id in PAN){const d=S.dock[id];$('#dock-'+d).append(pel[id]);pel[id].hidden=S.act[d]!==id}
  const sb=id=>`<button class="sb${S.act[S.dock[id]]===id?' on':''}" data-tw="${id}" title="${PAN[id][0]}" aria-label="${PAN[id][0]}">${ico(PAN[id][1])}</button>`;
  const ids=d=>Object.keys(PAN).filter(i=>S.dock[i]===d).map(sb).join('');
  $('#stripe-l').innerHTML=`<div>${ids('left')}</div><div>${ids('bottom')}</div>`;$('#stripe-r').innerHTML=`<div>${ids('right')}</div>`;
  requestAnimationFrame(()=>S.cvFit&&S.cvFit(true))}
function toggle(id){const d=S.dock[id];S.act[d]=S.act[d]===id?null:id;layout()}
function show(id){S.act[S.dock[id]]=id;layout()}
function move(id,d){const o=S.dock[id];if(o===d)return;S.dock[id]=d;if(S.act[o]===id)S.act[o]=Object.keys(PAN).find(i=>S.dock[i]===o)||null;S.act[d]=id;layout()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-tw]');if(b)toggle(b.dataset.tw)});
$$('.split').forEach(s=>s.addEventListener('pointerdown',e=>{const d=s.dataset.split,box=$('#dock-'+d),w=box.offsetWidth,hh=box.offsetHeight,sx=e.clientX,sy=e.clientY;s.setPointerCapture(e.pointerId);
  const mv=v=>{if(d==='left')box.style.width=clamp(w+v.clientX-sx,180,640)+'px';if(d==='right')box.style.width=clamp(w-(v.clientX-sx),200,640)+'px';if(d==='bottom')box.style.height=clamp(hh-(v.clientY-sy),110,620)+'px'};
  s.addEventListener('pointermove',mv);s.addEventListener('pointerup',()=>s.removeEventListener('pointermove',mv),{once:true})}));
