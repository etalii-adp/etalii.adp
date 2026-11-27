/* Designer: one entity type of an ontology model, with its attributes and relations. */
'use strict';

const TYPES=['text','int','decimal','date','datetime','boolean','enum','geo','kV','A','kVA','EUR'];
const splitAttr=a=>{const i=a.indexOf(': ');return i<0?[a,'text']:[a.slice(0,i),a.slice(i+2)]};
function rEntity(d,x){
  const O=x.parent,lock=ro(x)||x.ext?' disabled':'',rels=(O.rels||[]).filter(r=>(r[0]===x||r[1]===x)&&O.children.includes(r[0])&&O.children.includes(r[1]));
  const src=x.ext&&find(x.ext),orig=src&&(src.children||[]).find(k=>k.name===x.name&&!k.ext);
  if(!x.req)x.req=x.attrs.map((_,i)=>i<2);
  d.innerHTML=`<div class="tool">${tbar(x,`<span>${x.attrs.length} attributes · in ${esc(O.name)}</span>${x.ext?`<span class="chip">${ico('link')}Reference to ${esc(x.ext)}</span>`:''}<span class="sp"></span><button class="btn" style="height:24px" id="e-dia">${ico('graph','c-purple')}Show in Diagram</button>`)}<div class="scroll"><table class="grid"><thead><tr><th>Attribute</th><th>Data type</th><th>Required</th><th></th></tr></thead><tbody>${x.attrs.map((a,i)=>{const[nm,t]=splitAttr(a);return`<tr><td><input class="in mono cell" data-i="${i}" data-f="n" value="${esc(nm)}" aria-label="Attribute name"${lock}></td><td><select class="in mono cell" data-i="${i}" data-f="t" aria-label="Data type"${lock}>${[...new Set([t,...TYPES])].map(o=>`<option${o===t?' selected':''}>${esc(o)}</option>`).join('')}</select></td><td><input type="checkbox" data-i="${i}" data-f="r" aria-label="Required" ${x.req[i]?'checked':''}${lock}></td><td>${lock?'':`<button class="ib" data-del="${i}" title="Remove attribute">${ico('x')}</button>`}</td></tr>`}).join('')}</tbody></table>
   <div style="padding:8px 10px">${lock?(orig?`<button class="lnk" data-ent="${orig.id}">${ico('shapes','c-purple')}Open ${esc(x.name)} in ${esc(x.ext)}</button>`:''):`<button class="btn" id="e-add">${ico('plus')}Add Attribute</button>`}</div>
   ${rels.length?`<table class="grid"><thead><tr><th>Relation</th><th>From</th><th>To</th></tr></thead><tbody>${rels.map(r=>`<tr><td class="mono">${esc(r[2])}</td>${[r[0],r[1]].map(e=>`<td><button class="lnk" data-ent="${e.id}">${ico(e.icon||'shapes','c-purple')}${esc(e.name)}</button></td>`).join('')}</tr>`).join('')}</tbody></table>`:''}</div></div>`;
  const touch=()=>{if(!x.vcs)x.vcs='M';renderExplorer();renderProps()};
  d.onchange=e=>{const t=e.target,i=+t.dataset.i,f=t.dataset.f;if(!f)return;if(f==='r'){x.req[i]=t.checked}else{const[nm,ty]=splitAttr(x.attrs[i]);x.attrs[i]=f==='n'?(t.value.trim()||nm)+': '+ty:nm+': '+t.value}touch()};
  d.onclick=e=>{const dl=e.target.closest('[data-del]'),en=e.target.closest('[data-ent]');
    if(dl){x.attrs.splice(+dl.dataset.del,1);x.req.splice(+dl.dataset.del,1);touch();renderEditor()}
    else if(en)openDoc(BY[en.dataset.ent]);
    else if(e.target.closest('#e-add')){x.attrs.push('newAttribute: text');x.req.push(false);touch();renderEditor();const ins=$$('input[data-f="n"]',d).pop();ins.focus();ins.select()}
    else if(e.target.closest('#e-dia')){openDoc(O,'editor');pick(x);$$('.en',d).forEach(k=>k.classList.toggle('on',k.dataset.id===x.id))}}}
