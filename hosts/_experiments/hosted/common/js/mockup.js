/* What belongs to the mockup itself and not to the product it shows: the pager between the pages, and the notes that say what is not built. */
'use strict';

const only=()=>toast('Only Atlas Platform has example data in this mockup.');

$$('.pager-slot').forEach(s=>s.innerHTML=`<nav class="pager" aria-label="Mockup pages">${[['start','Start'],['login','Login'],['projects','Projects'],['ide','IDE']].map(([k,l])=>`<a data-nav href="${pageUrl(k)}" class="${k===navHere?'on':''}"${k===navHere?' aria-current="page"':''}>${l}</a>`).join('')}</nav>`);

document.addEventListener('click',e=>{
  const to=e.target.closest('[data-go]');if(to)go(to.dataset.go);
  const ny=e.target.closest('[data-nyi]');if(ny)toast(ny.dataset.nyi+' is not part of this mockup yet.')});
