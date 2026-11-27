/* Going from one page to another without a hard cut. Where the browser runs a view transition between two documents (transitions.css asks for it), a link simply navigates. Elsewhere the page turns out before it leaves and the next one turns in. */
'use strict';

const pageUrl=v=>navBase+(v==='start'?'':v+'/')+'index.html';
/* the browser knows view transitions between documents, and the last arrival did not show otherwise (boot.js) */
const navSmooth='CSSViewTransitionRule' in window&&(()=>{try{return sessionStorage.getItem(navSeenKey)!=='no'}catch{return true}})();
const navStill=matchMedia('(prefers-reduced-motion: reduce)').matches;

function leave(url){
  try{sessionStorage.setItem(navFromKey,navHere)}catch{}
  if(navSmooth||navStill){location.href=url;return}
  const r=document.documentElement;
  r.classList.toggle('back',navPages.indexOf(navPageOf(url))<navPages.indexOf(navHere));
  r.classList.add('leaving');
  setTimeout(()=>{location.href=url},200)}

/* go('login'), go('projects'), go('ide'), go('start') */
function go(v){if(v===navHere)return;if(typeof closePop==='function')closePop();leave(pageUrl(v))}

/* a page calls this once it has drawn itself */
function pageReady(){document.documentElement.classList.add('ready')}

/* links between the pages carry data-nav */
document.addEventListener('click',e=>{
  const a=e.target.closest('a[data-nav]');
  if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();
  if(navPageOf(a.href)!==navHere)leave(a.href)});
