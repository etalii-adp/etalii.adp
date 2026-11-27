/* Runs in the head of every page, before the first paint. It applies the theme, font size and density chosen in the IDE's settings, and works out how this page was reached, so the style sheets can turn the page in from the right side. */
'use strict';

/* preferences, kept across the pages */
const PREFS_KEY='adp-hosted-prefs';
const prefs=(()=>{try{return JSON.parse(localStorage.getItem(PREFS_KEY))||{}}catch{return{}}})();
const savePrefs=()=>{try{localStorage.setItem(PREFS_KEY,JSON.stringify(prefs))}catch{}};
const applyPrefs=()=>{const r=document.documentElement;if(prefs.theme)r.dataset.theme=prefs.theme;else delete r.dataset.theme;
  for(const k of['--fs','--row'])prefs[k]?r.style.setProperty(k,prefs[k]):r.style.removeProperty(k)};
const setTheme=t=>{prefs.theme=t||null;savePrefs();applyPrefs()};
const setVar=(k,v)=>{prefs[k]=v;savePrefs();applyPrefs()};
applyPrefs();

/* where this page sits among the others: the order is the way a visit runs, so going to an earlier page turns the other way */
const navPages=['start','login','projects','ide'];
const navHere=document.documentElement.dataset.page;
const navBase=document.documentElement.dataset.root||'';
const navFromKey='adp-hosted-from',navSeenKey='adp-hosted-transition';
const navPageOf=url=>{const m=/\/(login|projects|ide)\/(?:index\.html)?(?:[?#].*)?$/.exec(url||'');return m?m[1]:'start'};
let navCame=false;   /* true when this page was reached from another page of the mockup */
{
  let from=null;
  try{from=sessionStorage.getItem(navFromKey);sessionStorage.setItem(navFromKey,'')}catch{}
  navCame=!!from;
  const act=window.navigation&&navigation.activation;
  if(act&&act.from&&act.from.url)from=navPageOf(act.from.url);
  if(from&&navPages.indexOf(from)>navPages.indexOf(navHere))document.documentElement.classList.add('back');
}

/* a browser that runs a view transition between the two documents does the turn itself, so the page's own turn-in stays off; whether it did is remembered, so the next page knows if it has to turn out by itself */
addEventListener('pagereveal',e=>{if(e.viewTransition)document.documentElement.classList.add('vt');if(navCame)try{sessionStorage.setItem(navSeenKey,e.viewTransition?'yes':'no')}catch{}});
/* a page that comes back from the back/forward cache is shown as it was left */
addEventListener('pageshow',e=>{if(e.persisted){document.documentElement.classList.remove('leaving');document.documentElement.classList.add('ready')}});
/* a page shows itself once its scripts have drawn it (pageReady in nav.js); should a script fail, it still shows */
addEventListener('load',()=>setTimeout(()=>document.documentElement.classList.add('ready'),60));
