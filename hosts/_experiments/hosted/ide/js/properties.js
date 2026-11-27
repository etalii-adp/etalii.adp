/* The Properties tool window: a property grid for the selected item or the selected part of a tool. */
'use strict';

const WHO=['Sam Rivera','Priya Nair','Jonas Weber','Mei Tanaka'];
function nodeProps(x){
  if(x.pseudo)return{icon:'file',col:'muted',title:x.name,sub:'File',g:[['File',[['Name',x.name],['Path on disk',path(x)],['Ignored by git',x.ignored?'Yes':'No'],['Belongs to',x.parent.name]]],['Purpose',[['Holds',x.name==='.adp'?'Shared settings and canvas layout':x.name==='.user.adp'?'Your personal overrides':'Part of the stored form of '+x.parent.name]]]]};
  const L=linkOf(x),box=!!x.children,hsh=parseInt(x.id,36),R=ro(x);
  return{icon:x.icon||K[x.kind][1],col:K[x.kind][2],title:x.name,sub:K[x.kind][0],g:[
   ['General',[['Name',{name:1,lock:!!R}],['Kind',K[x.kind][0]],['ID',x.id],['Icon',{icon:1,lock:!!R}]]],
   x.kind==='entity'&&['Entity type',[['Model',x.parent.name],['Attributes',String(x.attrs.length)],x.ext&&['Defined in',x.ext]].filter(Boolean)],
   ['Storage',[['Path on disk',path(x)],['Stored as',emb(x)?'Inside '+K[x.parent.kind][3][0]+' of '+x.parent.name:multi(x)?K[x.kind][3].length+' files in a folder':box?'Folder with a .adp file':'One file'],box&&['View as',{mode:1}],box&&['Show all files',{all:1}],['Settings from',x.mode||S.moved[x.id]?'.adp, overridden by .user.adp':'.adp']].filter(Boolean)],
   L&&['Linked repository',[['Repository',L.link.repo],['Branch or tag',L===x?{ref:1}:L.link.ref],['Resolved commit',id36(L.link.ref+L.name)+'c'],['Access',L===x?'Items inside are read-only':'Read-only, from '+L.name]]],
   ['Git',[['Status',x.vcs==='M'?'Modified':x.vcs==='A'?'Added, not committed':'Unchanged'],['Branch',L?L.link.ref:'develop'],['Last change',WHO[hsh%4]+', '+(hsh%9+2)+' days ago']]],
   PROBLEMS.some(p=>p.node===x)&&['Problems',PROBLEMS.filter(p=>p.node===x).map(p=>[p.s[0].toUpperCase()+p.s.slice(1),p.m,p.s==='error'?1:0])]]}}
function renderProps(){
  const x=S.sel,P=S.insp||nodeProps(x),b=body('properties');
  const val=v=>{if(v&&typeof v==='object'){
      if(v.name)return`<span><input class="in" id="p-name" value="${esc(x.name)}" aria-label="Name"${v.lock?' disabled':''}></span>`;
      if(v.icon)return`<span><button class="tbtn" id="p-icon" style="height:22px;margin-left:-8px"${v.lock?' disabled':''}>${ico(x.icon||K[x.kind][1],'c-'+K[x.kind][2])}${x.icon?'Custom':'Default'}</button></span>`;
      if(v.mode)return`<span><select class="in" id="p-mode" aria-label="View as"><option value="logical"${modeOf(x)==='logical'?' selected':''}>Logical Structure</option><option value="files"${modeOf(x)==='files'?' selected':''}>File System</option></select></span>`;
      if(v.all)return`<span><input type="checkbox" id="p-all" aria-label="Show all files"${showAll(x)?' checked':''}${modeOf(x)==='files'?'':' disabled'}></span>`;
      if(v.ref)return`<span><select class="in mono" id="p-ref" aria-label="Branch or tag">${x.link.refs.map(r=>`<option${r===x.link.ref?' selected':''}>${esc(r)}</option>`).join('')}</select></span>`}
    return null};
  b.innerHTML=`<div class="pg-head">${ico(P.icon,'c-'+(P.col||'muted'))}<b>${esc(P.title)}</b><small>${esc(P.sub)}</small></div><div class="pgrid">${P.g.filter(Boolean).map(([h,rows])=>`<div class="pc">${h}</div>${rows.map(([k,v,red])=>`<div class="pr"><span><span class="v">${esc(k)}</span></span>${val(v)||`<span><span class="v${red?' red':''}${/[\/@]|^[a-z0-9]{6,7}$/.test(String(v))?' mono':''}" title="${esc(v)}">${esc(v)}</span></span>`}</div>`).join('')}`).join('')}</div>`;
  const nm=$('#p-name',b);if(nm)nm.onchange=()=>{const v=nm.value.trim(),err=nameError(x,v);if(err){toast(err);nm.value=x.name;return}x.name=v;if(!x.vcs)x.vcs='M';renderAll()};
  const ic=$('#p-icon',b);if(ic)ic.onclick=()=>{const r=ic.getBoundingClientRect();iconPick(x,r.left-120,r.bottom+3)};
  const md=$('#p-mode',b);if(md)md.onchange=()=>setMode(x,md.value);
  const al=$('#p-all',b);if(al)al.onchange=()=>{x.showAll=al.checked;renderAll()};
  const rf=$('#p-ref',b);if(rf)rf.onchange=()=>{x.link.ref=rf.value;renderAll();toast(`${x.name} now follows ${rf.value}`)}}
