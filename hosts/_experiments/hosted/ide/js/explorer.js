/* The Explorer: the tree, its two views, rename, add, delete, the icon picker and the context menu. */
'use strict';

body('explorer').innerHTML=`<div class="ex-bar"><div class="seg" id="ex-mode" title="How this level and everything under it is shown"><button data-mode="logical">Logical</button><button data-mode="files">Files</button></div><button class="ib" id="ex-eye" title="Show all files, including the ones git ignores">${ico('eye')}</button><small id="ex-for"></small></div><div class="ex-q"><input class="in" id="ex-q" placeholder="Search items" aria-label="Search items"></div><div class="tree" id="tree" tabindex="0" role="tree" aria-label="Explorer"></div>`;
$('[data-pa]',pel.explorer).innerHTML=`<button class="ib" id="ex-loc" title="Select the open document">${ico('target')}</button><button class="ib" id="ex-col" title="Collapse all">${ico('collapse')}</button>`;
const modeTarget=()=>{let x=S.sel;if(x.pseudo)x=x.parent;return x.children?x:x.parent};
const match=x=>x.name.toLowerCase().includes(S.q)||kids(x).some(match);
function rowHTML(x,d,has,open){
  const f=!x.pseudo&&asFile(x),box=x.children||(!x.pseudo&&multi(x));
  const icon=x.pseudo?'file':f?(box?'folder':'file'):(x.icon||K[x.kind][1]),sv=x.pseudo?null:sev(x);
  return`<div class="row${S.sel===x?' sel':''}${x.ignored?' ign':''}" data-id="${x.id}" style="--d:${d}" role="treeitem"><span class="tw${open?' open':''}">${has?ico('chev'):''}</span>${ico(icon,'c-'+(x.pseudo?'muted':K[x.kind][2]))}`+
   (S.edit===x?`<input class="in rn" id="rn" value="${esc(x.name)}" aria-label="Name">`:`<span class="nm${x.vcs?' v'+x.vcs:''}${f||x.pseudo?' mono':''}">${esc(x.pseudo?x.name:f?disk(x):x.name)}</span>`)+
   (x.link?`<span class="ref" title="Linked repository ${esc(x.link.repo)}">${ico('link')}${esc(x.link.ref)}</span>`:'')+(x.mode?`<span class="tag" title="This level has its own view setting">${x.mode}</span>`:'')+(sv?`<span class="dot ${sv}" title="Has ${sv}s"></span>`:'')+`</div>`}
function renderExplorer(){
  const out=[];(function rows(x,d){const ks=kids(x),vis=S.q?ks.filter(match):ks,open=S.q?true:S.open.has(x.id);out.push(rowHTML(x,d,ks.length>0,open));if(open)vis.forEach(k=>rows(k,d+1))})(ROOT,0);
  $('#tree').innerHTML=out.join('');
  const t=modeTarget(),m=modeOf(t);$$('#ex-mode button').forEach(b=>b.classList.toggle('on',b.dataset.mode===m));
  $('#ex-eye').disabled=m!=='files';$('#ex-eye').classList.toggle('on',m==='files'&&showAll(t));$('#ex-for').textContent='for '+t.name;
  const r=$('#rn');if(r){r.focus();r.select();r.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')endRename(true);if(e.key==='Escape')endRename(false)};r.onblur=()=>S.edit&&endRename(true,true);r.oninput=()=>{r.classList.remove('bad');$('.rnerr')?.remove()}}}
function setMode(t,m){if(t.parent&&modeOf(t.parent)===m)delete t.mode;else t.mode=m;if(!t.parent&&m==='logical')delete t.mode;S.open.add(t.id);renderAll();toast(`${t.name} now shows as ${m==='files'?'File System':'Logical Structure'}. Saved in its .user.adp`)}
$('#ex-mode').onclick=e=>{const b=e.target.closest('button');b&&setMode(modeTarget(),b.dataset.mode)};
$('#ex-eye').onclick=()=>{const t=modeTarget();t.showAll=!showAll(t);renderAll()};
$('#ex-q').oninput=e=>{S.q=e.target.value.trim().toLowerCase();renderExplorer()};
$('#ex-loc').onclick=()=>{pick(S.doc);$('#tree .sel')?.scrollIntoView({block:'nearest'})};
$('#ex-col').onclick=()=>{S.open=new Set([ROOT.id]);renderExplorer()};
const tree=$('#tree');
tree.addEventListener('click',e=>{const r=e.target.closest('.row');if(!r||e.target.closest('.rn'))return;const x=BY[r.dataset.id];
  if(e.target.closest('.tw')&&kids(x).length){S.open.has(x.id)?S.open.delete(x.id):S.open.add(x.id);renderExplorer();return}
  if(S.sel===x&&kids(x).length){S.open.has(x.id)?S.open.delete(x.id):S.open.add(x.id)}openDoc(x)});
tree.addEventListener('contextmenu',e=>{const r=e.target.closest('.row');if(!r)return;e.preventDefault();const x=BY[r.dataset.id];if(S.sel!==x)pick(x);menu(ctx(x),e.clientX,e.clientY)});
tree.addEventListener('keydown',e=>{if(e.target.id==='rn')return;const rows=$$('.row',tree),i=rows.findIndex(r=>r.classList.contains('sel')),x=S.sel;
  const go=j=>{const r=rows[clamp(j,0,rows.length-1)];r&&openDoc(BY[r.dataset.id]);$('#tree .sel')?.scrollIntoView({block:'nearest'});tree.focus()};
  if(e.key==='ArrowDown'){e.preventDefault();go(i+1)}else if(e.key==='ArrowUp'){e.preventDefault();go(i-1)}
  else if(e.key==='ArrowRight'&&kids(x).length){S.open.add(x.id);renderExplorer()}else if(e.key==='ArrowLeft'){if(S.open.has(x.id)&&kids(x).length){S.open.delete(x.id);renderExplorer()}else if(x.parent)openDoc(x.parent)}
  else if(e.key==='F2'&&!x.pseudo&&!ro(x)){e.preventDefault();rename(x)}else if(e.key==='Delete'&&!x.pseudo&&!ro(x)&&x!==ROOT)del(x)
  else if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();const r=rows[i].getBoundingClientRect();menu(ctx(x),r.left+60,r.bottom)}});

function nameError(x,v){if(!v)return'A name is required.';if(/[\\/:*?"<>|]/.test(v))return'A name cannot contain \\ / : * ? " < > |';
  if(x.parent&&x.parent.children.some(s=>s!==x&&s.name.toLowerCase()===v.toLowerCase()))return`"${v}" already exists in ${x.parent.name}.`;return null}
function rename(x){S.edit=x;reveal(x);renderExplorer()}
function endRename(apply,blur){const x=S.edit,r=$('#rn');if(!x||!r)return;const v=r.value.trim();
  if(apply){const err=nameError(x,v);if(err){if(blur){S.edit=null;renderExplorer();return}r.classList.add('bad');$('.rnerr')?.remove();r.closest('.row').after(el(`<div class="rnerr" style="--d:${r.closest('.row').style.getPropertyValue('--d')}">${esc(err)}</div>`));return}
    if(v!==x.name){x.name=v;if(!x.vcs)x.vcs='M'}}
  S.edit=null;renderAll();tree.focus()}
function add(p,kind){let base='New '+K[kind][0].toLowerCase(),nm=base,i=2;while(p.children.some(s=>s.name===nm))nm=base+' '+i++;
  const x={name:nm,kind,parent:p,vcs:'A',fresh:true,id:newShortGuid()};if(kind==='group'){x.children=[];x.accepts=p.accepts}if(kind==='ontology'){x.children=[];x.accepts=['entity'];x.rels=[]}if(kind==='entity')x.attrs=[];BY[x.id]=x;p.children.push(x);S.open.add(p.id);openDoc(x);rename(x)}
function del(x){const p=x.parent,i=p.children.indexOf(x);p.children.splice(i,1);S.tabs=S.tabs.filter(t=>!inside(t,x));if(inside(S.doc,x)||inside(S.sel,x))openDoc(p);else renderAll();
  toast(`Deleted ${x.name}${x.children?' and its '+x.children.length+' items':''}`,'Undo',()=>{p.children.splice(i,0,x);openDoc(x)})}
function iconPick(x,ax,ay){closePop();const cur=x.icon||K[x.kind][1],all=ICONSET.flatMap(g2=>g2[1]),nameOf=i=>(all.find(o=>o.nm===i)||{label:i}).label;
  const m=el(`<div class="menu ipick"><div class="mhead">Icon for ${esc(x.name)}</div><input class="in" id="ip-q" placeholder="Search ${all.length} icons" aria-label="Search icons" autocomplete="off"><div class="ip-list" id="ip-list"></div><div class="ip-foot" id="ip-name"></div><div class="msep"></div><button class="mi" data-ic=""><span class="lead"></span>Use the default for ${esc(K[x.kind][0].toLowerCase())}</button></div>`);
  const list=$('#ip-list',m),foot=$('#ip-name',m),q=$('#ip-q',m),rest=()=>foot.textContent='Current: '+nameOf(cur);
  const draw=()=>{const words=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    list.innerHTML=ICONSET.map(([cat,items])=>{const hit=items.filter(o=>words.every(w=>o.kw.includes(w)));return hit.length?`<h6>${cat}</h6><div class="icongrid">${hit.map(o=>`<button class="ib${o.nm===cur?' on':''}" data-ic="${o.nm}" title="${o.label}" aria-label="${o.label}">${ico(o.nm)}</button>`).join('')}</div>`:''}).join('')||`<div class="hint">No icon matches "${esc(q.value.trim())}".</div>`;rest()};
  const choose=i=>{if(i)x.icon=i;else delete x.icon;closePop();renderAll();toast('Icon saved in '+path(x.children?x:x.parent)+'/.adp')};
  q.oninput=draw;q.onkeydown=e=>{if(e.key==='Enter'){const f=$('[data-ic]',list);f&&choose(f.dataset.ic)}};
  list.onmouseover=e=>{const b2=e.target.closest('[data-ic]');b2?foot.textContent=b2.title:rest()};list.onmouseleave=rest;
  m.onclick=e=>{const b2=e.target.closest('[data-ic]');b2&&choose(b2.dataset.ic)};draw();place(m,ax,ay);q.focus()}
function linkRepo(p){dialog('Link Repository into '+p.name,`<label for="lr-u">Repository</label><input class="in mono" id="lr-u" value="git@git.example.com:shared/notification-service.git"><label for="lr-n">Show as</label><input class="in" id="lr-n" value="Notification service"><label for="lr-r">Branch or tag</label><select class="in" id="lr-r"><option>v1.4.0</option><option>v1.3.2</option><option>main</option></select>`,'Link',v=>{
  const x=n($('#lr-n',v).value.trim()||'Linked repository','group',[n('Email template','component'),n('Delivery pipeline','pipeline'),n('Delivery monitor','dashboard')],{icon:'chat',vcs:'A',link:{repo:$('#lr-u',v).value,ref:$('#lr-r',v).value,refs:['v1.4.0','v1.3.2','main']}});
  (function w(y,pp){y.parent=pp;y.id=newShortGuid();BY[y.id]=y;(y.children||[]).forEach(k=>w(k,y))})(x,p);p.children.push(x);S.open.add(p.id);S.open.add(x.id);openDoc(x);toast(`${x.name} is linked. Its items continue the hierarchy here.`)})}
const changed=x=>!!x.vcs||(x.children||[]).some(changed);
function ctx(x){
  if(x.pseudo)return[{l:'Open',k:'Enter',on:()=>openDoc(x)},'-',{l:'Git',i:'branch',sub:[{l:'Show History',on:()=>show('git')},{l:x.ignored?'Remove from .gitignore':'Add to .gitignore',d:x.name==='.adp'?'.adp files are always committed':null,on:()=>{x.ignored=!x.ignored;renderExplorer()}}]},{l:'Copy Path',on:()=>copy(path(x))}];
  const box=!!x.children,pure=isBox(x),R=ro(x),why=R?`Read-only, from ${R.name} @ ${R.link.ref}`:null,m=box?modeOf(x):null;
  return[
   box&&{l:'New',i:'plus',d:why,sub:(x.accepts||['group','doc']).map(k=>({l:K[k][0],i:K[k][1],on:()=>add(x,k)}))},
   {l:'Open',k:'Enter',i:pure?'canvas':'edit',on:()=>openDoc(x)},
   {l:pure?'Open as Contents List':'Show in Canvas',k:'Alt+C',i:pure?'list':'canvas',on:()=>openDoc(x,pure?'editor':'canvas')},'-',
   {l:'Rename…',k:'F2',d:why,on:()=>rename(x)},
   {l:'Change Icon…',d:why,on:()=>{const r=$(`.row[data-id="${x.id}"]`)?.getBoundingClientRect();iconPick(x,r?r.left+40:200,r?r.bottom:200)}},
   {l:'Delete',k:'Del',d:x===ROOT?'The project root stays':why,on:()=>del(x)},'-',
   box&&{l:'View As',i:'eye',sub:[{l:'Logical Structure',chk:m==='logical',on:()=>setMode(x,'logical')},{l:'File System',chk:m==='files',on:()=>setMode(x,'files')},'-',{l:'Show All Files',chk:m==='files'&&showAll(x),d:m!=='files'?'File System view only':null,on:()=>{x.showAll=!showAll(x);renderAll()}}]},
   x.link&&{l:'Switch Branch or Tag',i:'branch',sub:x.link.refs.map(r=>({l:r,chk:r===x.link.ref,on:()=>{x.link.ref=r;renderAll();toast(`${x.name} now follows ${r}`)}}))},
   x.link&&{l:'Update from Remote',i:'fetch',on:()=>toast(`${x.name} is up to date with ${x.link.ref}`)},
   x.link&&{l:'Unlink Repository',on:()=>del(x)},
   pure&&!x.link&&{l:'Link Repository…',i:'link',d:why,on:()=>linkRepo(x)},'-',
   {l:'Git',i:'branch',sub:[{l:'Commit…',k:'Ctrl+K',d:changed(x)?null:'No local changes',on:()=>show('commit')},{l:'Show History',on:()=>show('git')},{l:'Compare with Branch…',on:()=>toast('Comparing '+x.name+' with origin/develop')},{l:'Rollback…',d:changed(x)?null:'No local changes',on:()=>{(function w(y){delete y.vcs;(y.children||[]).forEach(w)})(x);renderAll();toast('Rolled back local changes in '+x.name)}}]},
   box&&{l:`Find in ${x.name}…`,k:'Ctrl+Shift+F',i:'search',on:()=>{show('explorer');const q=$('#ex-q');q.placeholder='Search in '+x.name;q.focus()}},
   {l:'Copy',sub:[{l:'Name',on:()=>copy(x.name)},{l:'Path on Disk',on:()=>copy(path(x))},{l:'ID',on:()=>copy(x.id)}]},'-',
   {l:'Properties',k:'Alt+Enter',i:'props',on:()=>{pick(x);show('properties')}}]}
