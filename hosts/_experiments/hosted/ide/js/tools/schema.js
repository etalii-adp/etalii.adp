/* Designer: data schemas, with the generated JSON Schema beside it. */
'use strict';

const FT=['string','int','decimal','boolean','date','datetime','enum','object','array'];
function mapOk(m){if(!m)return true;const[e,a]=m.split('.');return Object.values(BY).some(k=>k.kind==='entity'&&!k.ext&&k.name===e&&k.attrs.some(t=>t.startsWith(a+':')))}
function rSchema(d,x){
  if(!x.fields)x.fields=(x.fresh?[]:SCHEMA[x.name]||SCHEMAD).map(f=>[...f]);
  if(!x.sf)x.sf={format:x.name.includes('Bronze')||x.name.includes('Silver')?'Parquet':'JSON',version:'3',compat:'Backward'};
  const lock=ro(x)?' disabled':'',json=x.sview==='json',used=(SUSED[x.name]||[]).map(find).filter(Boolean);
  const js=()=>JSON.stringify({title:x.name,type:'object',required:x.fields.filter(f=>f[2]).map(f=>f[0]),properties:Object.fromEntries(x.fields.map(f=>[f[0],{type:({int:'integer',decimal:'number',date:'string',datetime:'string',enum:'string'})[f[1]]||f[1],...(f[1]==='datetime'?{format:'date-time'}:f[1]==='date'?{format:'date'}:{}),...(f[1]==='enum'&&f[3]?{enum:f[3].split(' | ')}:f[3]?{description:f[3]}:{}),...(f[4]?{'x-ontology':f[4]}:{})}]))},null,2);
  const opt=(list,v)=>list.map(o=>`<option${o===v?' selected':''}>${o}</option>`).join('');
  d.innerHTML=`<div class="tool">${tbar(x,`<span>${x.fields.length} fields · version ${esc(x.sf.version)}</span><span class="sp"></span><div class="seg" id="s-view"><button data-v="designer" class="${json?'':'on'}">Designer</button><button data-v="json" class="${json?'on':''}">JSON Schema</button></div>`)}${json?`<div class="code" tabindex="0">${hl(js())}</div>`:`<div class="scroll"><div class="form" style="padding-bottom:10px"><h3>Schema</h3>
    <div class="fl"><span>Format</span><select class="in" id="s-format" data-h="format"${lock}>${opt(['JSON','Avro','Parquet','CSV'],x.sf.format)}</select></div>
    <div class="fl"><span>Version</span><input class="in" id="s-version" data-h="version" value="${esc(x.sf.version)}" style="max-width:120px"${lock}></div>
    <div class="fl"><span>Compatibility</span><select class="in" id="s-compat" data-h="compat"${lock}>${opt(['Backward','Forward','Full','None'],x.sf.compat)}</select></div>
    <div class="fl"><span>Used by</span><span class="chips">${used.map(u=>`<button type="button" class="lnk" data-ent="${u.id}">${ico(u.icon||K[u.kind][1],'c-'+K[u.kind][2])}${esc(u.name)}</button>`).join('')||'<span class="wait">Nothing uses this schema yet</span>'}</span></div><h3>Fields</h3></div>
   <table class="grid"><thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraint</th><th>Maps to ontology</th><th></th></tr></thead><tbody>${x.fields.map((f,i)=>`<tr><td><input class="in mono cell" data-i="${i}" data-c="0" value="${esc(f[0])}" aria-label="Field name"${lock}></td><td><select class="in mono cell" data-i="${i}" data-c="1" aria-label="Type"${lock}>${opt(FT,f[1])}</select></td><td><input type="checkbox" data-i="${i}" data-c="2" aria-label="Required" ${f[2]?'checked':''}${lock}></td><td><input class="in cell" data-i="${i}" data-c="3" value="${esc(f[3])}" placeholder="None" aria-label="Constraint"${lock}></td><td><input class="in mono cell${mapOk(f[4])?'':' badmap'}" data-i="${i}" data-c="4" value="${esc(f[4])}" placeholder="Not mapped" aria-label="Maps to ontology" title="${mapOk(f[4])?'Entity type and attribute, such as Meter.serialNumber':'No ontology model defines '+esc(f[4])}"${lock}></td><td>${lock?'':`<button class="ib" data-del="${i}" title="Remove field">${ico('x')}</button>`}</td></tr>`).join('')}</tbody></table>
   <div style="padding:8px 10px">${lock?'':`<button class="btn" id="s-add">${ico('plus')}Add Field</button>`}</div></div>`}</div>`;
  const touch=()=>{if(!x.vcs)x.vcs='M';renderExplorer();renderProps()};
  d.onchange=e=>{const t=e.target;if(t.dataset.h){x.sf[t.dataset.h]=t.value;touch();return}if(t.dataset.c===undefined)return;const i=+t.dataset.i,cI=+t.dataset.c;x.fields[i][cI]=cI===2?t.checked:t.value.trim();
    if(cI===4){const ok=mapOk(x.fields[i][4]);t.classList.toggle('badmap',!ok);t.title=ok?'Entity type and attribute, such as Meter.serialNumber':'No ontology model defines '+x.fields[i][4]}touch()};
  d.onclick=e=>{const v=e.target.closest('#s-view button'),dl=e.target.closest('[data-del]'),en=e.target.closest('[data-ent]');
    if(v){x.sview=v.dataset.v;renderEditor()}else if(dl){x.fields.splice(+dl.dataset.del,1);touch();renderEditor()}else if(en)openDoc(BY[en.dataset.ent])
    else if(e.target.closest('#s-add')){x.fields.push(['newField','string',false,'','']);touch();renderEditor();const ins=$$('input[data-c="0"]',d).pop();ins.focus();ins.select()}}}
