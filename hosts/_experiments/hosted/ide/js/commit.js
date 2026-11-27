/* The Commit tool window. */
'use strict';

function renderCommit(){const b=body('commit'),tot=CH.reduce((a,g2)=>a+g2.files.length,0),on=CH.reduce((a,g2)=>a+g2.files.filter(f=>f.on).length,0);
  b.innerHTML=`<div class="cm-h">Changes on develop · ${on} of ${tot} files selected · grouped by item</div><div class="cm-list">${tot?CH.map((g2,i)=>g2.files.length?`<label class="cm-g"><input type="checkbox" data-g="${i}" ${g2.files.every(f=>f.on)?'checked':''} aria-label="${esc(g2.node.name)}">${ico(g2.node.icon||K[g2.node.kind][1],'c-'+K[g2.node.kind][2])}<span data-open="${g2.node.id}">${esc(g2.node.name)}</span><small>${crumbsOf(g2.node).slice(1,-1).map(q=>esc(q.name)).join(' › ')}</small></label>${g2.files.map((f,j)=>`<label class="cm-f"><input type="checkbox" data-g="${i}" data-f="${j}" ${f.on?'checked':''}>${ico('file','c-muted')}<span class="mono nm v${f.s}">${esc(f.f)}</span></label>`).join('')}`:'').join(''):'<div class="hint">Nothing to commit. Your working tree matches develop.</div>'}</div>
   <div class="cm-box"><textarea class="in" id="cm-msg" placeholder="Commit message" aria-label="Commit message">${esc(S.cmsg??'Add tariff classes and the outage map page')}</textarea><div class="acts"><button class="btn pri" id="cm-go" ${on?'':'disabled'}>Commit</button><button class="btn" id="cm-push" ${on?'':'disabled'}>Commit and Push…</button><label style="display:flex;gap:6px;align-items:center;color:var(--muted)"><input type="checkbox" id="cm-amend">Amend</label></div></div>`;
  b.onchange=e=>{const t=e.target;if(t.dataset.g===undefined)return;const g2=CH[t.dataset.g];if(t.dataset.f!==undefined)g2.files[t.dataset.f].on=t.checked;else g2.files.forEach(f=>f.on=t.checked);S.cmsg=$('#cm-msg').value;renderCommit()};
  b.onclick=e=>{const o=e.target.closest('[data-open]');if(o){e.preventDefault();openDoc(BY[o.dataset.open])}};
  const go=push=>{const msg=$('#cm-msg').value.trim();if(!msg){toast('Write a commit message first.');$('#cm-msg').focus();return}
    CH.forEach(g2=>{g2.files=g2.files.filter(f=>!f.on);if(!g2.files.length&&g2.node.vcs)delete g2.node.vcs});
    COMMITS.forEach(cm=>cm.p=cm.p.map(i=>i+1));for(const k in HEADS)HEADS[k]++;COMMITS.unshift({h:id36(msg+Date.now())+'a',l:0,p:[1],m:msg,a:'Sam Rivera',w:'Just now',d:0});HEADS.develop=0;S.ahead++;S.cmsg='';
    if(push){HEADS['origin/develop']=0;S.ahead=0}renderCommit();renderGit();renderAll();renderTitle();toast(`Committed ${on} files to develop${push?' and pushed to origin':''}`)};
  $('#cm-go').onclick=()=>go(false);$('#cm-push').onclick=()=>go(true)}
