/* The Git tool window: branch tree, commit graph with filters, commit details. */
'use strict';

const reach=i=>{const s=new Set();(function go(j){if(s.has(j)||!COMMITS[j])return;s.add(j);COMMITS[j].p.forEach(go)})(i);return s};
const LC=['blue','green','orange'];
function renderGit(){
  const b=body('git'),G=S.git;if(!$('.git',b)){b.innerHTML=`<div class="git"><div class="g-br" id="g-br"></div><div class="g-log"><div class="g-bar"><input class="in" id="g-q" placeholder="Text or hash" aria-label="Search commits"><button class="tbtn" id="g-fb"></button><button class="tbtn" id="g-fu"></button><button class="tbtn" id="g-fd"></button><span class="sp"></span><button class="ib" id="g-fetch" title="Fetch all remotes">${ico('fetch')}</button></div><div class="g-rows" id="g-rows"></div></div><div class="g-det" id="g-det"></div></div>`;
    $('#g-q').oninput=e=>{G.q=e.target.value.toLowerCase();renderGit()};
    $('#g-fb').onclick=e=>menuAt(e.currentTarget,[{l:'All branches',chk:!G.branch,on:()=>{G.branch=null;renderGit()}},'-',...Object.keys(HEADS).map(k=>({l:k,chk:G.branch===k,on:()=>{G.branch=k;renderGit()}}))]);
    $('#g-fu').onclick=e=>menuAt(e.currentTarget,[{l:'Everyone',chk:!G.user,on:()=>{G.user=null;renderGit()}},{l:'Me',chk:G.user==='Sam Rivera',on:()=>{G.user='Sam Rivera';renderGit()}},'-',...WHO.slice(1).map(u=>({l:u,chk:G.user===u,on:()=>{G.user=u;renderGit()}}))]);
    $('#g-fd').onclick=e=>menuAt(e.currentTarget,[[null,'Any time'],[1,'Last 24 hours'],[7,'Last 7 days']].map(([v,l])=>({l,chk:G.days===v,on:()=>{G.days=v;renderGit()}})));
    $('#g-fetch').onclick=()=>toast('Fetched origin. Nothing new since 4 minutes ago.');
    $('#g-br').onclick=e=>{const r=e.target.closest('[data-b]');if(r){G.branch=G.branch===r.dataset.b?null:r.dataset.b;renderGit()}};
    $('#g-rows').onclick=e=>{const r=e.target.closest('[data-c]');if(r){G.sel=+r.dataset.c;renderGit()}}}
  const br=(k,label,d,icn='branch',extra='')=>`<div class="row${G.branch===k?' sel':''}" data-b="${k}" style="--d:${d}"><span class="tw"></span>${ico(icn,k==='develop'?'c-green':'c-muted')}<span class="nm">${label}</span>${extra}</div>`;
  $('#g-br').innerHTML=`<h5>Local</h5>${br('develop','develop',0,'branch',`<span class="ref">${S.behind?'↓'+S.behind:''}${S.ahead?' ↑'+S.ahead:''}${!S.behind&&!S.ahead?'in sync':''}</span>`)}${br('features/load-forecast','features/load-forecast',0)}<h5>Remote · origin</h5>${br('origin/develop','develop',0)}${br('origin/features/outage-map','features/outage-map',0)}<h5>Tags</h5>${br('v0.8.0','v0.8.0',0,'tagi')}<h5>Linked repositories</h5>${find('Components').children.filter(k=>k.link).map(k=>`<div class="row" style="--d:0" data-open="${k.id}"><span class="tw"></span>${ico('link','c-muted')}<span class="nm">${esc(k.name)}</span><span class="ref">${esc(k.link.ref)}</span></div>`).join('')}`;
  $('#g-fb').innerHTML=`Branch: <b>${G.branch||'All'}</b>`;$('#g-fu').innerHTML=`User: <b>${G.user||'All'}</b>`;$('#g-fd').innerHTML=`Date: <b>${G.days?'Last '+(G.days===1?'24 hours':'7 days'):'All'}</b>`;
  const set=G.branch?reach(HEADS[G.branch]):null,filtered=!!(G.q||G.user||G.days||G.branch);
  const vis=COMMITS.map((cm,i)=>i).filter(i=>{const cm=COMMITS[i];return(!set||set.has(i))&&(!G.user||cm.a===G.user)&&(!G.days||cm.d<G.days)&&(!G.q||cm.m.toLowerCase().includes(G.q)||cm.h.includes(G.q))});
  const refs=i=>Object.keys(HEADS).filter(k=>HEADS[k]===i).map(k=>`<span class="lbl c-${k==='develop'?'green':k.startsWith('v')?'yellow':k.startsWith('origin')?'purple':'blue'}">${k==='develop'?'HEAD → ':''}${k}</span>`).join('');
  const RH=26,X=l=>14+l*14,Y=r=>r*RH+13;let svg='';
  vis.forEach((i,r)=>{const cm=COMMITS[i];if(!filtered)cm.p.forEach(j=>{const a=cm.l,b2=COMMITS[j].l,col=`var(--${LC[Math.max(a,b2)]})`,d=a===b2?`M${X(a)} ${Y(i)}L${X(a)} ${Y(j)}`:a<b2?`M${X(a)} ${Y(i)}C${X(a)} ${Y(i)+13} ${X(b2)} ${Y(i)+13} ${X(b2)} ${Y(i)+RH}L${X(b2)} ${Y(j)}`:`M${X(a)} ${Y(i)}L${X(a)} ${Y(j)-RH}C${X(a)} ${Y(j)-13} ${X(b2)} ${Y(j)-13} ${X(b2)} ${Y(j)}`;svg+=`<path d="${d}" style="fill:none;stroke:${col};stroke-width:1.6"/>`})});
  vis.forEach((i,r)=>{const cm=COMMITS[i];svg+=`<circle cx="${X(filtered?0:cm.l)}" cy="${Y(r)}" r="4" style="fill:var(--${LC[filtered?0:cm.l]});stroke:var(--bg);stroke-width:1.5"/>`});
  $('#g-rows').innerHTML=vis.length?`<svg width="64" height="${vis.length*RH}">${svg}</svg>`+vis.map(i=>{const cm=COMMITS[i];return`<button class="g-row${G.sel===i?' on':''}" data-c="${i}">${refs(i)}<span class="msg">${esc(cm.m)}</span><span class="who">${cm.a}</span><span class="when">${cm.w}</span></button>`}).join(''):'<div class="hint">No commits match these filters.</div>';
  const cm=COMMITS[G.sel]||COMMITS[0];
  $('#g-det').innerHTML=`<h6>${esc(cm.m)}</h6><p><span class="mono">${cm.h}</span> · ${cm.a} · ${cm.w}</p>${[['Meter readings to Bronze','M'],['Pipelines','M'],['Data quality rules','M']].slice(0,cm.p.length>1?1:3).map(([nm,s])=>{const q=find(nm);return q?`<div>${ico(q.icon||K[q.kind][1],'c-'+K[q.kind][2])}<span class="nm v${s}">${esc(q.name)}</span></div>`:''}).join('')}`}
body('git').addEventListener('click',e=>{const o=e.target.closest('[data-open]');o&&openDoc(BY[o.dataset.open])});
