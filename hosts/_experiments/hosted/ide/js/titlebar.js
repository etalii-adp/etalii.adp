/* The title bar (menus, project and branch widgets, update and push, run, settings) and the status bar. */
'use strict';

const MENUS={
 File:[{l:'New Item…',k:'Ctrl+N',on:()=>{const t=modeTarget();menu(ctx(t).find(i=>i&&i.l==='New').sub,220,60)}},{l:'Open Project…'},{l:'Link Repository…',on:()=>linkRepo(find('Components'))},'-',{l:'Settings…',k:'Ctrl+Alt+S'},'-',{l:'Close Project',on:()=>go('projects')},{l:'Sign Out',on:()=>go('login')}],
 Edit:[{l:'Undo',k:'Ctrl+Z'},{l:'Redo',k:'Ctrl+Y'},'-',{l:'Rename…',k:'F2',on:()=>!S.sel.pseudo&&!ro(S.sel)&&rename(S.sel)},{l:'Find in Items…',k:'Ctrl+Shift+F',on:()=>{show('explorer');$('#ex-q').focus()}}],
 View:[{h:'Tool windows'},...Object.keys(PAN).map(id=>({l:PAN[id][0],get chk(){return S.act[S.dock[id]]===id},on:()=>toggle(id)})),'-',{l:'Switch Document and Canvas',k:'Alt+C',on:()=>flip()},{l:'Restore Default Layout',on:()=>resetLayout()}],
 Navigate:[{l:'Search Everywhere',k:'Shift Shift',on:()=>{show('explorer');$('#ex-q').focus()}},{l:'Go to Item by ID…'},{l:'Select Open Document in Explorer',on:()=>pick(S.doc)},{l:'Up One Level',on:()=>S.doc.parent&&openDoc(S.doc.parent)}],
 Tools:[{l:'Validate Solution',on:()=>{show('problems');toast('Validated 96 items: 2 errors, 3 warnings, 3 notes')}},{l:'Run Test Suites',on:()=>toast('3 test suites queued on Staging')},{l:'Generate Documentation'}],
 Git:[{l:'Commit…',k:'Ctrl+K',on:()=>show('commit')},{l:'Push…',k:'Ctrl+Shift+K',on:()=>push()},{l:'Update Project…',k:'Ctrl+T',on:()=>pull()},{l:'Fetch',on:()=>toast('Fetched origin. Nothing new since 4 minutes ago.')},'-',{l:'New Branch…'},{l:'Show Git Log',on:()=>show('git')}],
 Window:[{l:'Restore Default Layout',on:()=>resetLayout()},{l:'Close All Tabs',on:()=>{S.tabs=[];openDoc(ROOT)}}],
 Help:[{l:'Getting Started'},{l:'Keyboard Shortcuts'},{l:'About ADP 2026.3'}]};
function resetLayout(){const[d,a]=JSON.parse(DOCK0);S.dock=d;S.act=a;['left','right','bottom'].forEach(k=>{$('#dock-'+k).style.width='';$('#dock-'+k).style.height=''});layout()}
function flip(){const x=S.doc;if(x.pseudo)return;S.dm[x.id]=dmode(x)==='canvas'?'editor':'canvas';S.insp=null;renderEditor();renderProps()}
function pull(){if(!S.behind)return toast('develop is up to date with origin/develop');COMMITS.forEach(cm=>cm.p=cm.p.map(i=>i+1));for(const k in HEADS)HEADS[k]++;COMMITS.unshift({h:'m'+id36(String(Date.now())),l:0,p:[1,HEADS['origin/develop']],m:"Merge remote-tracking branch 'origin/develop' into develop",a:'Sam Rivera',w:'Just now',d:0});HEADS.develop=0;const nb=S.behind;S.behind=0;S.ahead++;renderGit();renderTitle();renderStatus();toast(`Merged ${nb} incoming commits into develop`)}
function push(){if(!S.ahead)return toast('Nothing to push');const na=S.ahead;if(S.behind)return toast('Update the project first: origin/develop has '+S.behind+' commits you do not have.','Update',pull);HEADS['origin/develop']=HEADS.develop;S.ahead=0;renderGit();renderTitle();renderStatus();toast(`Pushed ${na} commits to origin/develop`)}
function renderTitle(){
  $('#w-branch').innerHTML=`${ico('branch','c-muted')}<span>develop</span>`;
  $('#w-pull').innerHTML=`${ico('down',S.behind?'c-blue':'')}<b>${S.behind||''}</b>`;$('#w-push').innerHTML=`${ico('up',S.ahead?'c-green':'')}<b>${S.ahead||''}</b>`}
$('#menus').innerHTML=Object.keys(MENUS).map(m=>`<button class="tbtn" data-m="${m}">${m}</button>`).join('');
$('#menus').onclick=e=>{const b=e.target.closest('[data-m]');b&&menuAt(b,MENUS[b.dataset.m])};
$('#burger').innerHTML=ico('menu');$('#burger').onclick=e=>menuAt(e.currentTarget,[...Object.keys(MENUS).map(m=>({l:m,sub:MENUS[m]})),'-',{h:'Go to'},{l:'Start',on:()=>go('start')},{l:'Login',on:()=>go('login')},{l:'Projects',on:()=>go('projects')}]);
$('#w-proj').onclick=e=>menuAt(e.currentTarget,[{h:'Open project'},{l:'Atlas Platform',chk:true},{h:'Recent'},{l:'Field Service App',on:()=>only()},{l:'Tariff Calculator',on:()=>only()},'-',{l:'All Projects…',on:()=>go('projects')},{l:'Close Project',on:()=>go('projects')}]);
$('#w-branch').onclick=e=>menuAt(e.currentTarget,[{l:'Update Project…',k:'Ctrl+T',i:'down',on:pull},{l:'Commit…',k:'Ctrl+K',i:'commit',on:()=>show('commit')},{l:'Push…',k:'Ctrl+Shift+K',i:'up',on:push},{l:'Fetch',i:'fetch',on:()=>toast('Fetched origin. Nothing new since 4 minutes ago.')},'-',{l:'New Branch…',i:'plus'},{l:'Checkout Tag or Revision…'},'-',{h:'Local'},{l:'develop',chk:true},{l:'features/load-forecast'},{h:'Remote'},{l:'origin/develop'},{l:'origin/features/outage-map'}]);
$('#w-pull').onclick=pull;$('#w-push').onclick=push;$('#w-fetch').innerHTML=ico('fetch');$('#w-fetch').onclick=()=>toast('Fetched origin. Nothing new since 4 minutes ago.');
let RUN='Deploy to staging';const runBtn=()=>$('#w-run').innerHTML=`${ico('rocket','c-red')}<span>${RUN}</span>`;runBtn();
$('#w-run').onclick=e=>menuAt(e.currentTarget,[{h:'Release pipelines'},...find('Release pipelines').children.map(k=>({l:k.name,chk:RUN===k.name,on:()=>{RUN=k.name;runBtn()}})),{h:'Test suites'},...find('Test suites').children.map(k=>({l:k.name,chk:RUN===k.name,on:()=>{RUN=k.name;runBtn()}}))]);
$('#w-go').innerHTML=ico('play');$('#w-go').onclick=()=>toast(RUN+' started');
$('#w-search').innerHTML=ico('search');$('#w-search').onclick=()=>{show('explorer');$('#ex-q').focus()};
$('#w-gear').innerHTML=ico('gear');$('#w-gear').onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),th=document.documentElement.dataset.theme,fs=getComputedStyle(document.documentElement).getPropertyValue('--fs').trim(),rw=getComputedStyle(document.documentElement).getPropertyValue('--row').trim();
  menu([{h:'Theme'},{l:'Dark',chk:th==='dark',on:()=>setTheme('dark')},{l:'Light',chk:th==='light',on:()=>setTheme('light')},{l:'Follow the system',chk:!th,on:()=>setTheme(null)},{h:'Font size'},...[['12px','Small'],['13px','Default'],['14px','Large']].map(([v,l])=>({l,chk:fs===v,on:()=>setVar('--fs',v)})),{h:'Density'},...[['22px','Compact'],['24px','Default'],['28px','Comfortable']].map(([v,l])=>({l,chk:rw===v,on:()=>setVar('--row',v)})),'-',{l:'Restore Default Layout',on:resetLayout},{l:'All Settings…',k:'Ctrl+Alt+S'}],r.right-210,r.bottom+3)};
$('#w-user').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();menu([{h:'Sam Rivera · sam.rivera@example.com'},{l:'Account Settings…',i:'user'},{l:'Switch Project…',on:()=>go('projects')},'-',{l:'Sign Out',on:()=>go('login')}],r.right-230,r.bottom+3)};
function renderStatus(){const x=S.sel,er=PROBLEMS.filter(p=>p.s==='error').length,wa=PROBLEMS.filter(p=>p.s==='warning').length,code=!x.pseudo&&K[x.kind][4]==='code'||x.pseudo;
  $('#status').innerHTML=`<span class="st path" title="${esc(path(x))}">${crumbsOf(x).map(p=>esc(p.name)).join(' › ')}</span>
   <button class="st" data-tw="problems" title="Open Problems">${ico('error','c-red')}${er}${ico('warning','c-yellow')}${wa}</button>
   <span class="st mono hide-s" title="Hidden item ID">ID ${x.id}</span>
   <span class="st hide-s">${x.pseudo?'File':modeOf(levelOf(x))==='files'?'File System':'Logical Structure'}</span>
   ${code?'<span class="st hide-s">Ln 1, Col 1 · LF · UTF-8</span>':''}
   <span class="st hide-s">${ico('link')}${find('Components').children.filter(k=>k.link).length} linked repositories</span>
   <span class="st hide-s"><span class="led"></span>Staging healthy</span>
   <button class="st" data-tw="git" title="Open Git">${ico('branch')}develop ${S.behind?'↓'+S.behind:''} ${S.ahead?'↑'+S.ahead:''}</button>
   <span class="st hide-s">Fetched 4 min ago</span><span class="st hide-s">Example data</span>`}
addEventListener('keydown',e=>{if(e.altKey&&e.key.toLowerCase()==='c'){e.preventDefault();flip()}});
