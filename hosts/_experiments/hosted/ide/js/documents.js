/* Selection and the document area: tabs, breadcrumbs, and the switch between a tool and the canvas. */
'use strict';

const dmode=x=>x.pseudo?'editor':S.dm[x.id]||(isBox(x)?'canvas':'editor');
const levelOf=x=>x.pseudo?levelOf(x.parent):x.children?x:x.parent;
function reveal(x){for(let p=x.parent;p;p=p.parent)S.open.add(p.id)}
function openDoc(x,mode){S.doc=S.sel=x;S.insp=null;if(mode&&!x.pseudo)S.dm[x.id]=mode;if(!S.tabs.includes(x)){S.tabs.push(x);if(S.tabs.length>7)S.tabs.splice(S.tabs.findIndex(t=>t!==x),1)}reveal(x);renderAll()}
function pick(x){S.sel=x;S.insp=null;reveal(x);renderExplorer();renderProps();renderStatus();$$('.card').forEach(k=>k.classList.toggle('on',k.dataset.id===x.id))}
function renderAll(){renderExplorer();renderEditor();renderProps();renderStatus()}

$('#dm').onclick=e=>{const b=e.target.closest('button');if(b&&!S.doc.pseudo){S.dm[S.doc.id]=b.dataset.dm;S.insp=null;renderEditor();renderProps()}};
$('#tabs').onclick=e=>{const t=e.target.closest('.tab');if(!t)return;const x=BY[t.dataset.id];
  if(e.target.closest('.x')){const i=S.tabs.indexOf(x);S.tabs.splice(i,1);if(S.doc===x)openDoc(S.tabs[Math.max(0,i-1)]||ROOT);else renderEditor();return}openDoc(x)};
$('#crumbs').onclick=e=>{const b=e.target.closest('button');b&&openDoc(BY[b.dataset.id])};
const tabIcon=x=>x.pseudo?'file':x.icon||K[x.kind][1];
function renderEditor(){
  const x=S.doc,m=dmode(x),tool=x.pseudo?'Editor':isBox(x)?'Contents':WORD[K[x.kind][4]];
  $('#tabs').innerHTML=S.tabs.map(t=>`<button class="tab${t===x?' on':''}" data-id="${t.id}">${ico(tabIcon(t),'c-'+(t.pseudo?'muted':K[t.kind][2]))}<span class="${t.vcs?'nm v'+t.vcs:''}">${esc(t.name)}</span><span class="x" title="Close">${ico('x')}</span></button>`).join('');
  $('#dm').innerHTML=`<button data-dm="editor" class="${m==='editor'?'on':''}" title="Alt+C switches between the two">${ico(isBox(x)?'list':'edit')}${tool}</button><button data-dm="canvas" class="${m==='canvas'?'on':''}" title="Alt+C switches between the two">${ico('canvas')}Canvas</button>`;
  $('#tabs .on')?.scrollIntoView({block:'nearest',inline:'nearest'});
  const cr=crumbsOf(m==='canvas'?levelOf(x):x);
  $('#crumbs').innerHTML=cr.map((p,i)=>`${i?ico('chev'):''}<button data-id="${p.id}" class="${i===cr.length-1?'cur':''}">${ico(tabIcon(p),'c-'+(p.pseudo?'muted':K[p.kind][2]))}${esc(p.name)}</button>`).join('');
  /* a model with child items shows that level in its own diagram, so it takes part in the level tweens just as a canvas does */
  const d=$('#doc'),L=m==='canvas'?levelOf(x):null,V=L||(x.children&&!x.pseudo&&!isBox(x)?x:null),tw=V&&S.cvL&&S.cvL!==V&&S.anim?tween(S.cvL,V,d):null;
  d.innerHTML='';S.cvFit=null;S.cvL=V;
  if(L){renderCanvas(d,L);tw&&play(tw,d);return}
  d.onclick=d.onchange=d.ondblclick=null;
  if(x.pseudo)return rCode(d,x);
  if(isBox(x))return rContents(d,x);
  ({flow:rFlow,onto:rOnto,entity:rEntity,schema:rSchema,page:rPage,dash:rDash,form:rForm,check:rCheck,doc:rDoc,code:rCode})[K[x.kind][4]](d,x);
  tw&&play(tw,d)}
const tbar=(x,extra='')=>`<div class="tb"><span class="tk">${WORD[K[x.kind][4]]} · ${K[x.kind][0]}</span>${ro(x)||x.link?`<span class="chip">${ico('lock')}Read-only, from ${esc((linkOf(x)).name)} @ ${esc(linkOf(x).link.ref)}</span>`:''}${extra}</div>`;
function inspect(o){S.insp=o;renderProps();if(S.act.right!=='properties'&&S.dock.properties==='right'&&innerWidth>900)show('properties')}
const curve=(x1,y1,x2,y2)=>{const dx=Math.max(30,Math.abs(x2-x1)/2);return`M${x1} ${y1}C${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`};
const curveL=(x1,y1,x2,y2)=>{const dx=Math.max(30,Math.abs(x2-x1)/2);return`M${x1} ${y1}C${x1-dx} ${y1} ${x2+dx} ${y2} ${x2} ${y2}`};   /* right to left */
const ARROW=`<defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--muted);stroke:none"/></marker></defs>`;
