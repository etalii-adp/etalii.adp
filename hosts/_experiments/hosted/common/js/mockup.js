/* What belongs to the mockup itself and not to the product it shows: the buttons that go to another page, and the notes that say what is not built. */
'use strict';

const only=()=>toast('Only Atlas Platform is available on this computer.');

document.addEventListener('click',e=>{
  const to=e.target.closest('[data-go]');if(to)go(to.dataset.go);
  const ny=e.target.closest('[data-nyi]');if(ny)toast(ny.dataset.nyi+' is not available yet.')});
