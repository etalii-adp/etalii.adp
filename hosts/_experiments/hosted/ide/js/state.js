/* What the IDE remembers while it is open: selection, tabs, expanded items, docks, git counters. */
'use strict';

const S={sel:null,doc:null,tabs:[],open:new Set(),dm:{},q:'',insp:null,view:{},edit:null,moved:{},ahead:1,behind:3,pf:{error:1,warning:1,info:1},
  dock:{explorer:'left',commit:'left',properties:'right',problems:'right',git:'bottom'},act:{left:'explorer',right:'properties',bottom:'git'},
  git:{branch:null,user:null,days:null,q:'',sel:0}};
const DOCK0=JSON.stringify([S.dock,S.act]);
S.anim=!matchMedia('(prefers-reduced-motion: reduce)').matches;try{const a=localStorage.getItem('adp-ide-anim');if(a!==null)S.anim=a==='1'}catch{}
['Atlas Platform','Ingestion','Sources','Pipelines','Ontology','Asset model','Components'].forEach(x=>S.open.add(find(x).id));
