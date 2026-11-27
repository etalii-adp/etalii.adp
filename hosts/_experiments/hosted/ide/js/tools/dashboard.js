/* Designer: analysis views. */
'use strict';

function rDash(d,x){
  const D=DASH[x.name]||DASH['Load forecast overview'],A=[],B=[];
  for(let i=0;i<=24;i++){const s=Math.sin((i-9)/24*2*Math.PI);A.push(D.base+D.amp*s*.62+Math.sin(i*2.3)*D.amp*.09);B.push(D.base+D.amp*s*.58)}
  const lo=Math.floor(Math.min(...A,...B)/50)*50,hi=Math.ceil(Math.max(...A,...B)/50)*50,X=i=>46+i*(580/24),Y=v=>190-(v-lo)/(hi-lo)*172,pts=a=>a.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const ticks=[0,1,2,3,4].map(t=>lo+(hi-lo)*t/4),mx=Math.max(...D.bars.map(b=>b[1]));
  d.innerHTML=`<div class="tool">${tbar(x,`<span>Reads from Silver · refreshed 2 min ago</span>`)}<div class="scroll"><div class="dash">${D.k.map(k=>`<div class="kpi"><small>${k[0]}</small><b>${k[1]}</b><span>${k[2]}</span></div>`).join('')}
   <div class="cardp wide"><h4>${D.lt} (${D.lu})</h4><svg viewBox="0 0 640 214" role="img" aria-label="${D.lt}">${ticks.map(t=>`<line x1="46" x2="626" y1="${Y(t)}" y2="${Y(t)}" style="stroke:var(--line)"/><text x="40" y="${Y(t)+4}" text-anchor="end">${Math.round(t)}</text>`).join('')}${[0,6,12,18,24].map(hr=>`<text x="${X(hr)}" y="208" text-anchor="middle">${String(hr).padStart(2,'0')}:00</text>`).join('')}<polygon points="46,190 ${pts(A)} 626,190" style="fill:var(--blue);opacity:.12"/><polyline points="${pts(B)}" style="fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 4"/><polyline points="${pts(A)}" style="fill:none;stroke:var(--blue);stroke-width:2"/><circle cx="${X(24)}" cy="${Y(A[24])}" r="3.5" style="fill:var(--blue)"/></svg><div class="legend"><span><i></i>Actual</span><span><i class="d"></i>${D.l2}</span></div></div>
   <div class="cardp side"><h4>${D.bt}</h4><div class="hb">${D.bars.map(b=>`<span>${b[0]}</span><div style="width:${Math.round(b[1]/mx*100)}%"></div><b style="font-weight:500">${b[1]}</b>`).join('')}</div></div></div></div></div>`}
