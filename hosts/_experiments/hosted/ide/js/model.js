/* The hierarchy as the IDE reads it: ids, lookup, paths on disk, the logical and file-system views of a level, and problem severity. */
'use strict';

const BY={};
const id36=s=>{let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619);return(h>>>0).toString(36).padStart(6,'0').slice(-6)};
(function walk(x,p,pth){x.parent=p;x.id=id36(pth);BY[x.id]=x;(x.children||[]).forEach(k=>walk(k,x,pth+'/'+k.name))})(ROOT,null,'atlas');
const find=name=>Object.values(BY).find(x=>x.name===name&&!x.pseudo);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const multi=x=>Array.isArray(K[x.kind][3]);
const emb=x=>K[x.kind][3]==='@';   /* stored inside its parent's file */
const isBox=x=>!!x.children&&!K[x.kind][4];   /* a pure container, with no tool of its own */
const disk=x=>x.children||multi(x)?slug(x.name):slug(x.name)+(K[x.kind][3]||'');
const linkOf=x=>!x?null:x.link?x:linkOf(x.parent);
const ro=x=>linkOf(x.parent);
const path=x=>x.pseudo?path(x.parent)+'/'+x.name:emb(x)?path(x.parent)+'/'+K[x.parent.kind][3][0]+'#'+x.name:x===ROOT?'atlas-platform':x.link?'../shared/'+x.link.repo.split('/').pop().replace('.git',''):path(x.parent)+'/'+disk(x);
const modeOf=x=>x.mode||(x.parent?modeOf(x.parent):'logical');
const showAll=x=>x.showAll??(x.parent?showAll(x.parent):false);
const asFile=x=>!!x.parent&&modeOf(x.parent)==='files';
const crumbsOf=x=>{const a=[];for(let p=x;p;p=p.parent)a.unshift(p);return a};
const inside=(x,a)=>{for(let p=x;p;p=p.parent)if(p===a)return true;return false};
const pfCache={};
const pf=(owner,name,ign)=>pfCache[owner.id+name]||(pfCache[owner.id+name]=BY['f'+id36(owner.id+name)]={pseudo:true,name,kind:'file',parent:owner,id:'f'+id36(owner.id+name),ignored:!!ign});
function kids(x){
  if(x.pseudo)return[];
  const fm=x.children?modeOf(x)==='files':asFile(x);
  if(!fm)return x.children?[...x.children]:[];
  const r=(x.children||[]).filter(k=>!emb(k));
  if(multi(x))r.push(...K[x.kind][3].map(f=>pf(x,f)));
  if(x.children||multi(x)){r.push(pf(x,'.adp'));if(showAll(x)){r.push(pf(x,'.user.adp',1));if(multi(x))r.push(pf(x,'preview.cache',1))}}
  return r}

const sevRank={error:2,warning:1};
function sev(x){let s=null;for(const p of PROBLEMS)if(p.node===x&&sevRank[p.s]&&(!s||sevRank[p.s]>sevRank[s]))s=p.s;
  for(const k of x.children||[]){const t=sev(k);if(t&&(!s||sevRank[t]>sevRank[s]))s=t}return s}
