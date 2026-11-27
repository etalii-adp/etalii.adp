/* Designer: form-based settings (data sources, models, agents, environments, themes, components). */
'use strict';

function rForm(d,x){
  const secs=(FORM[x.kind]||(()=>[['General',[['Name','text',x.name],['Owner','text','Platform team']]]]))(x),lock=ro(x)?' disabled':'';
  const ctl=([l,t,v],i)=>{const id='f'+i+'-'+slug(l);let c;
    if(t==='sel')c=`<select class="in" id="${id}"${lock}><option>${esc(v)}</option><option>Other…</option></select>`;
    else if(t==='area')c=`<textarea class="in" id="${id}" rows="4"${lock}>${esc(v)}</textarea>`;
    else if(t==='tog')c=`<span><input type="checkbox" id="${id}" ${v?'checked':''}${lock}></span>`;
    else if(t==='chips')c=`<span class="chips" id="${id}">${v.map(s=>`<span class="chip">${esc(s)}</span>`).join('')}<button class="chip" type="button" data-nyi="Add">${ico('plus')}</button></span>`;
    else if(t==='ref'){const r=find(v);c=`<button type="button" class="lnk" id="${id}" data-ref="${r?r.id:''}">${r?ico(r.icon||K[r.kind][1],'c-'+K[r.kind][2]):''}${esc(v)}</button>`}
    else if(t==='secret')c=`<span class="mono" id="${id}" style="display:flex;gap:6px;align-items:center;color:var(--muted)">${ico('lock')}${esc(v)}</span>`;
    else c=`<input class="in${t==='mono'?' mono':''}" id="${id}" value="${esc(v)}"${t==='num'?' inputmode="decimal" style="max-width:120px"':''}${lock}>`;
    return`<div class="fl"><span>${esc(l)}</span>${c}</div>`};
  let i=0;d.innerHTML=`<div class="tool">${tbar(x)}<div class="scroll"><div class="form">${secs.map(([h,fs])=>`<h3>${h}</h3>${fs.map(f=>ctl(f,i++)).join('')}`).join('')}</div></div></div>`;
  d.onclick=e=>{const b=e.target.closest('[data-ref]');if(b&&b.dataset.ref)openDoc(BY[b.dataset.ref])}}
