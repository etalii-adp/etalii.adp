/* The contents list of a container. */
'use strict';

function rContents(d,x){d.innerHTML=`<div class="tool"><div class="tb"><span class="tk">Contents · ${esc(x.name)}</span><span>${x.children.length} items</span></div><div class="scroll"><table class="grid"><thead><tr><th>Name</th><th>Kind</th><th>ID</th><th>Items</th><th>Git</th></tr></thead><tbody>${x.children.map(k=>`<tr class="clk" data-id="${k.id}"><td>${ico(k.icon||K[k.kind][1],'c-'+K[k.kind][2])}${esc(k.name)}</td><td class="wait">${K[k.kind][0]}</td><td class="mono wait">${k.id}</td><td class="wait">${k.children?k.children.length:''}</td><td class="${k.vcs==='A'?'ok':''}" style="${k.vcs==='M'?'color:var(--blue)':''}">${k.vcs==='M'?'Modified':k.vcs==='A'?'Added':''}</td></tr>`).join('')}</tbody></table></div></div>`;
  d.onclick=e=>{const r=e.target.closest('tr[data-id]');r&&openDoc(BY[r.dataset.id])}}
