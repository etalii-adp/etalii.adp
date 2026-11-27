/* Menus with submenus, toasts and dialogs. */
'use strict';

let popEl=null;
function closePop(){popEl&&popEl.remove();popEl=null;$$('.tbtn.open').forEach(b=>b.classList.remove('open'))}
function buildMenu(items){
  const m=el('<div class="menu" role="menu"></div>');
  items.filter(Boolean).forEach(it=>{
    if(it==='-'){m.append(el('<div class="msep"></div>'));return}
    if(it.h){m.append(el(`<div class="mhead">${esc(it.h)}</div>`));return}
    const dis=!!it.d;
    const b=el(`<button class="mi${dis?' dis':''}" role="menuitem"><span class="lead">${it.chk?ico('check'):it.i?ico(it.i):''}</span><span>${esc(it.l)}</span>${dis&&typeof it.d==='string'?`<span class="why">${esc(it.d)}</span>`:it.k?`<kbd>${it.k}</kbd>`:''}${it.sub&&!dis?ico('chev','more'):''}</button>`);
    if(dis&&typeof it.d==='string')b.title=it.d;
    if(it.sub&&!dis){b.append(buildMenu(it.sub));b.addEventListener('click',e=>{if(e.target.closest('.menu')===m){e.stopPropagation();$$('.mi.open',m).forEach(o=>o!==b&&o.classList.remove('open'));b.classList.toggle('open')}})}
    else b.addEventListener('click',e=>{e.stopPropagation();if(dis)return;closePop();it.on&&it.on()});
    m.append(b)});
  return m}
function place(m,x,y){document.body.append(m);popEl=m;const r=m.getBoundingClientRect();
  if(x+r.width*2>innerWidth)m.classList.add('flip');
  m.style.left=clamp(x,6,innerWidth-r.width-6)+'px';m.style.top=clamp(y,6,innerHeight-r.height-6)+'px'}
function menu(items,x,y){closePop();place(buildMenu(items),x,y)}
function menuAt(btn,items){const was=btn.classList.contains('open');closePop();if(was)return;const r=btn.getBoundingClientRect();menu(items,r.left,r.bottom+3);btn.classList.add('open')}
addEventListener('pointerdown',e=>{if(popEl&&!popEl.contains(e.target)&&!e.target.closest('.tbtn.open'))closePop()},true);
addEventListener('keydown',e=>{if(e.key==='Escape'){closePop();$('.veil')?.remove()}});
let toastT;
function toast(msg,act,fn){$('.toast')?.remove();const t=el(`<div class="toast" role="status"><span>${esc(msg)}</span>${act?`<button>${esc(act)}</button>`:''}</div>`);
  if(act)$('button',t).onclick=()=>{t.remove();fn()};document.body.append(t);clearTimeout(toastT);toastT=setTimeout(()=>t.remove(),act?7000:3600)}
function dialog(title,body,ok,fn){const v=el(`<div class="veil"><form class="dlg"><h2>${esc(title)}</h2>${body}<div class="acts"><button type="button" class="btn" data-x>Cancel</button><button class="btn pri">${esc(ok)}</button></div></form></div>`);
  $('[data-x]',v).onclick=()=>v.remove();$('form',v).onsubmit=e=>{e.preventDefault();fn(v);v.remove()};document.body.append(v);$('input',v)?.focus()}
function copy(t){const done=()=>toast('Copied '+t);try{navigator.clipboard.writeText(t).then(done,done)}catch{done()}}
