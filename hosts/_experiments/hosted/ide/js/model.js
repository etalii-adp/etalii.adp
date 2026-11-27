/* The hierarchy as the IDE reads it: ids, lookup, paths on disk, the logical and file-system views of a level, and problem severity. */
'use strict';

const BY={};
/* An item's id is a ShortGuid, as in the other ADP hosts (ShortGuid in the standalone host; "encoding": "base36" in DISL 11.5.1): a UUID, written as its 128-bit value in lowercase base 36 and left-padded with 0 to 25 characters, the smallest width every UUID fits in. */
const SHORT_GUID_LENGTH=25;
const shortGuid=bytes=>bytes.reduce((n,b)=>n<<8n|BigInt(b),0n).toString(36).padStart(SHORT_GUID_LENGTH,'0');
/* a new item gets a random UUID (version 4) */
const newShortGuid=()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;return shortGuid(b)};
/* an example item gets a UUID made from its place in the hierarchy (version 8), so it has the same id on every load, as ShortGuid.FromName gives one name one id in the standalone host */
const shortGuidOf=name=>{const b=new Uint8Array(16),v=new DataView(b.buffer);
  for(let i=0;i<4;i++){let h=2166136261^Math.imul(i+1,0x9e3779b1);for(const ch of name)h=Math.imul(h^ch.codePointAt(0),16777619);
    h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;v.setUint32(i*4,h>>>0)}
  b[6]=b[6]&15|128;b[8]=b[8]&63|128;return shortGuid(b)};
(function walk(x,p,pth){x.parent=p;x.id=shortGuidOf(pth);BY[x.id]=x;(x.children||[]).forEach(k=>walk(k,x,pth+'/'+k.name))})(ROOT,null,'atlas');
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
const pf=(owner,name,ign)=>pfCache[owner.id+name]||(pfCache[owner.id+name]=BY[shortGuidOf('file/'+owner.id+'/'+name)]={pseudo:true,name,kind:'file',parent:owner,id:shortGuidOf('file/'+owner.id+'/'+name),ignored:!!ign});
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
