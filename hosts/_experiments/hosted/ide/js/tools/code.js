/* Editor: plain text with light highlighting, and the text of the .adp and .user.adp files. */
'use strict';

function hl(src,kw){return src.split('\n').map(l=>{const m=l.match(/^(.*?)((?:--|#|\/\/) .*|#$)$/);let code=m?m[1]:l,com=m?m[2]:'';
  code=esc(code).replace(/(&quot;[^&]*?&quot;|'[^']*')|\b(\d+(?:\.\d+)?)\b|^(\s*-?\s*)([\w.@-]+)(:)(?=\s|$)/g,(a,s,nu,lead,key,col)=>s?`<span class="s">${s}</span>`:nu?`<span class="nu">${nu}</span>`:`${lead}<span class="ky">${key}</span>${col}`);
  if(kw)code=code.replace(/(<span[^>]*>.*?<\/span>)|\b(select|from|where|group by|order by|left join|join|on|as|and|or|not|null|is|sum|max|count|desc|with|having|interval|limit|import|def|return)\b/gi,(a,sp,kw)=>sp||`<span class="kw">${kw}</span>`);
  return`<div>${code}${com?`<span class="cm">${esc(com)}</span>`:''}</div>`}).join('')}

function adpText(x,user){const o=x.pseudo?x.parent:x;
  return user?`# Your personal overrides for ${o.name}. Ignored by git, so they stay on this computer.\nview: ${modeOf(o)}\nshowAllFiles: ${showAll(o)}\ncanvas:\n  layout:\n${(o.children||[]).slice(0,3).map((k,i)=>`    ${k.id}: { x: ${i*300+40}, y: ${i%2*120+20} }   # ${k.name}`).join('\n')||'    {}'}`
  :`# Shared settings for ${o.name}. Committed with the project.\nid: ${o.id}\nname: "${o.name}"\nkind: ${o.kind}\nicon: ${o.icon||K[o.kind][1]}\nview: logical            # logical or files\nshowAllFiles: false\n${o.link?`link:\n  repository: "${o.link.repo}"\n  ref: "${o.link.ref}"\n`:''}children:\n${(o.children||[]).map(k=>`  - id: ${k.id}            # ${k.name}`).join('\n')||'  []'}\ncanvas:\n  layout:\n${(o.children||[]).map((k,i)=>`    ${k.id}: { x: ${i%3*300}, y: ${Math.floor(i/3)*210} }`).join('\n')||'    {}'}`}
function textOf(x){
  if(x.pseudo){if(x.name==='.adp')return adpText(x);if(x.name==='.user.adp')return adpText(x,1);
    if(x.name.endsWith('.sql'))return`-- Stored form of ${x.parent.name}. Edit it through its diagram in Logical Structure view.\nselect meter_id, read_at, value_kwh\nfrom bronze.meter_readings\nwhere quality = 'ok'`;
    return`# ${x.name}\n# Stored form of ${x.parent.name}. Edit it through its tool in Logical Structure view.\nitem: ${x.parent.id}\nname: "${x.parent.name}"\nkind: ${x.parent.kind}`}
  if(x.fresh)return'';
  if(CODE[x.name])return CODE[x.name];
  if(x.kind==='schema')return`{\n  "title": "${x.name}",\n  "type": "object",\n  "required": ["meterId", "readAt", "value"],\n  "properties": {\n    "meterId": { "type": "string" },\n    "readAt": { "type": "string", "format": "date-time" },\n    "value": { "type": "number", "minimum": 0 },\n    "unit": { "enum": ["kWh", "kW", "V"] }\n  }\n}`;
  if(x.kind==='vocabulary')return`# ${x.name}, a SKOS vocabulary used by the ontology\n@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n@prefix atlas: <https://atlas.example.com/vocab/> .\n\natlas:${slug(x.name)} a skos:ConceptScheme ;\n  skos:prefLabel "${x.name}" .\n\natlas:residential a skos:Concept ;\n  skos:inScheme atlas:${slug(x.name)} ;\n  skos:prefLabel "Residential" .\n\natlas:commercial a skos:Concept ;\n  skos:inScheme atlas:${slug(x.name)} ;\n  skos:prefLabel "Commercial" .`;
  if(x.kind==='prompt')return`# ${x.name}\n\nYou write for customers of an energy company.\n\nGiven the outage record below, write two sentences:\n1. What happened and where, in plain words.\n2. When power is expected back, only if the record has an estimate.\n\nNever guess a cause. Never promise a time the record does not contain.`;
  if(x.kind==='notebook')return`# ${x.name}\nimport pandas as pd\n\nactual = pd.read_sql("select * from silver.system_load", atlas)\nforecast = pd.read_sql("select * from gold.load_forecast", atlas)\n\nerror = (forecast.load_mw - actual.load_mw).abs() / actual.load_mw\nerror.groupby(actual.read_at.dt.hour).mean().plot()   # error per hour of day`;
  return`-- ${x.name}\nselect 1`}
function rCode(d,x){const t=textOf(x),lang=x.pseudo?(x.name.split('.').pop()||'adp').toUpperCase():(K[x.kind][3]||'').replace(/^\./,'').toUpperCase();
  d.innerHTML=`<div class="tool"><div class="tb"><span class="tk">Editor · ${x.pseudo?'File':K[x.kind][0]}</span><span>${esc(lang)}</span>${x.ignored?'<span class="chip">Ignored by git</span>':''}</div><div class="code" tabindex="0">${hl(t||' ',x.pseudo?x.name.endsWith('.sql'):x.kind==='code'||x.kind==='notebook')}</div></div>`}
