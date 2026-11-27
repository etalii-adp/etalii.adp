/* Diagram: ontology models. Each model carries its entity types as child items, so the hierarchy and the diagram show the same things. */
'use strict';

Object.values(BY).filter(x=>x.kind==='ontology').forEach(x=>{const O=ONTO[x.name]||{e:[],r:[]};x.accepts=['entity'];
  x.children=O.e.map(e=>({name:e[0],kind:'entity',parent:x,ex:e[1],ey:e[2],attrs:[...e[3]],ext:e[4],id:shortGuidOf('entity/'+x.id+'/'+e[0]),...(e[4]?{icon:'link'}:{})}));
  x.children.forEach(k=>BY[k.id]=k);x.rels=O.r.map(([a,b,l])=>[x.children[a],x.children[b],l])});
function rOnto(d,x){
  const E=x.children||[],W=170,M=24,hh=e=>38+e.attrs.length*19;
  E.forEach((e,i)=>{if(e.ex===undefined){const placed=E.filter(o=>o.ex!==undefined);e.ex=(placed.filter(o=>o.fresh).length%4)*250;e.ey=Math.max(0,...placed.filter(o=>!o.fresh).map(o=>o.ey+hh(o)))+40}});
  const R=(x.rels||[]).filter(r=>E.includes(r[0])&&E.includes(r[1]));
  const w=M*2+W+Math.max(0,...E.map(e=>e.ex)),h=M*2+Math.max(0,...E.map(e=>e.ey+hh(e)));
  const line=([A,B,l])=>{const ax=M+A.ex,ay=M+A.ey,bx=M+B.ex,by=M+B.ey,dx=bx-ax,dy=by-ay;let p,q;
    if(Math.abs(dx)>Math.abs(dy)){p=[ax+(dx>0?W:0),ay+hh(A)/2];q=[bx+(dx>0?-2:W+2),by+hh(B)/2]}else{p=[ax+W/2,ay+(dy>0?hh(A):0)];q=[bx+W/2,by+(dy>0?-2:hh(B)+2)]}
    return`<line marker-end="url(#ar)" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/><text x="${(p[0]+q[0])/2}" y="${(p[1]+q[1])/2-5}" text-anchor="middle">${esc(l)}</text>`};
  d.innerHTML=`<div class="tool">${tbar(x,`<span>${E.length} entity types, ${R.length} relations</span>`)}<div class="tbody"><div class="tbox"><h4>Toolbox</h4><div><span class="sq c-purple"></span>Entity type</div><div><span class="sq c-blue"></span>Relation</div><div><span class="sq c-yellow"></span>Attribute</div><div><span class="sq c-muted"></span>Reference</div><small>Dashed entity types come from another model. Double-click one to edit its attributes.</small></div><div class="surf" style="display:flex">${E.length?`<div class="dg" style="width:${w}px;height:${h}px;flex:none"><svg>${ARROW}${R.map(line).join('')}</svg>${E.map(e=>`<button class="en${e.ext?' ext':''}${S.sel===e?' on':''}" data-id="${e.id}" style="left:${M+e.ex}px;top:${M+e.ey}px;height:${hh(e)}px"><b>${ico(e.icon||'shapes','c-purple')}${esc(e.name)}</b>${e.attrs.map(a=>`<i>${esc(a)}</i>`).join('')}</button>`).join('')}</div>`:`<div class="hint">No entity types yet. Right-click ${esc(x.name)} in the Explorer and choose New, or drag one from the toolbox.</div>`}</div></div></div>`;
  d.onclick=e=>{const b=e.target.closest('.en');if(!b)return;$$('.en',d).forEach(k=>k.classList.toggle('on',k===b));pick(BY[b.dataset.id])};
  d.ondblclick=e=>{const b=e.target.closest('.en');b&&openDoc(BY[b.dataset.id])}}
