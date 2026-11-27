/* The start page: the point cloud, the names of its four pictures, and the way in. */
'use strict';

const SEEN=[
  ['Text','Written down, line by line.',shapeText()],
  ['Diagram','Drawn, as parts and the flows between them.',shapeDiagram()],
  ['Hierarchy','Organised, from the whole down to the detail.',shapeHierarchy()],
  ['Knowledge','Connected, so people and AI can reason over it.',shapeKnowledge()]];

/* the cloud takes its colours from the theme, so it follows dark and light */
const rgbOf=name=>{const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim(),h=v.replace('#','');
  return h.length===3?[...h].map(c=>parseInt(c+c,16)):[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const cloud=makeCloud($('#cloud'),SEEN.map(s=>s[2]),()=>({views:['--fg','--blue','--green','--purple'].map(rgbOf),accent:rgbOf('--mark')}));

$('#sp-pick').innerHTML=SEEN.map((s,i)=>`<button data-i="${i}" aria-pressed="${!i}" class="${i?'':'on'}">${s[0]}</button>`).join('');
function named(i){$$('#sp-pick button').forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-pressed',k===i)});
  const l=$('#sp-line');l.classList.add('out');setTimeout(()=>{l.textContent=SEEN[i][1];l.classList.remove('out')},260)}
cloud.onturn=named;
$('#sp-line').textContent=SEEN[0][1];
$('#sp-pick').onclick=e=>{const b=e.target.closest('button');b&&cloud.show(+b.dataset.i,true)};
const turn=()=>cloud.show((cloud.index+1)%SEEN.length,true);
$('#cloud').onclick=turn;$('#sp-turn').onclick=turn;
addEventListener('keydown',e=>{if(e.key==='ArrowRight')turn();if(e.key==='ArrowLeft')cloud.show((cloud.index+SEEN.length-1)%SEEN.length,true)});

pageReady();
