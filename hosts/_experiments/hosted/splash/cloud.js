/* A cloud of points in space that is one picture from the front and another from the side. Each point keeps its height; its place from left to right is the first picture, and its depth is the next one. Turning the cloud a quarter brings the next picture to the front, so nothing is redrawn: the same points are only looked at from somewhere else. */
'use strict';

/* dots along the strokes of a picture, n of them, ordered from top to bottom so that a point keeps roughly its height from one picture to the next */
function cloudPoints(strokes,n){
  let seed=20261127;const rnd=()=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
  const len=strokes.map(s=>Math.hypot(s[2]-s[0],s[3]-s[1])*s[4]),total=len.reduce((a,b)=>a+b,0),pts=[];
  strokes.forEach((s,i)=>{const k=Math.max(2,Math.round(n*len[i]/total));for(let j=0;j<k;j++){const t=(j+.2+.6*rnd())/k;pts.push([s[0]+(s[2]-s[0])*t,s[1]+(s[3]-s[1])*t,rnd()])}});
  /* the picture sits in the middle of the cloud */
  const mid=k=>{let lo=Infinity,hi=-Infinity;for(const q of pts){lo=Math.min(lo,q[k]);hi=Math.max(hi,q[k])}return(lo+hi)/2},mx=mid(0),my=mid(1);pts.forEach(q=>{q[0]-=mx;q[1]-=my});
  while(pts.length>n)pts.splice(Math.floor(rnd()*pts.length),1);
  while(pts.length<n){const p=pts[Math.floor(rnd()*pts.length)];pts.push([p[0],p[1],rnd()])}
  pts.sort((p,q)=>p[1]-q[1]||p[2]-q[2]);
  const out=new Float32Array(n*2);pts.forEach((p,i)=>{out[i*2]=p[0];out[i*2+1]=p[1]});return out}

/* makeCloud(canvas, pictures, colours) draws pictures[0] and returns {show(i), index, onturn}. colours() gives one colour per picture and the accent. */
function makeCloud(canvas,pictures,colours){
  const N=innerWidth<700?1500:2600,P=pictures.map(s=>cloudPoints(s,N)),g=canvas.getContext('2d'),still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const depth=new Float32Array(N),tone=new Uint8Array(N);
  let at=0,to=0,p=1,z0=null,W=0,H=0,U=1,yaw=0,pitch=0,yawTo=0,pitchTo=0,held=0,last=0,auto=!still,col=colours();
  for(let i=0;i<N;i++){depth[i]=P[1][i*2];tone[i]=i%9===0?1:0}
  const api={index:0,onturn:null,show(i,byHand){if(byHand)auto=false;if(i===to||p<1)return;to=i;p=0;z0=Float32Array.from(depth);api.index=i;api.onturn&&api.onturn(i);if(still){p=1;land()}}};
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  function land(){for(let i=0;i<N;i++)depth[i]=-P[at][i*2];at=to;held=0}
  function size(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);U=Math.min(W/3.7,H/2.25)}
  const mix=(a,b,t)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;
  function frame(now){
    const dt=Math.min(50,now-last||16);last=now;
    if(p<1){p=Math.min(1,p+dt/1500);if(p===1)land()}
    else{held+=dt;const next=P[(at+1)%P.length];for(let i=0;i<N;i++)depth[i]+=(next[i*2]-depth[i])*Math.min(1,dt*.004);if(auto&&held>3200)api.show((at+1)%P.length)}
    /* a nudge from the pointer rocks the cloud, and it settles back into the picture */
    yawTo*=Math.pow(.9,dt/16);pitchTo*=Math.pow(.9,dt/16);yaw+=(yawTo-yaw)*.12;pitch+=(pitchTo-pitch)*.12;
    const e=p<1?ease(p):0,A=P[at],B=P[to],th=e*Math.PI/2,cs=Math.cos(th),sn=Math.sin(th),sway=still?0:.012*Math.sin(now/1700),cy=Math.cos(yaw+sway),sy=Math.sin(yaw+sway),cp=Math.cos(pitch),sp=Math.sin(pitch),lens=Math.sin(Math.PI*e)*.11;
    g.clearRect(0,0,W,H);
    const paint=[mix(col.views[at],col.views[to],e),mix(col.accent,col.accent,0)];   /* most points take the picture's colour, one in nine the accent */
    for(let band=0;band<3;band++)for(let t=0;t<2;t++){
      g.fillStyle=paint[t];g.globalAlpha=[.45,.75,1][band];const sz=[1.4,1.9,2.4][band]+(t?.4:0);
      for(let i=0;i<N;i++){if(tone[i]!==t)continue;
        const xa=A[i*2],ya=A[i*2+1];let x=xa,y=ya,z=depth[i];
        if(p<1){const zb=z0[i]+(B[i*2]-z0[i])*e;x=xa*cs+zb*sn;z=-xa*sn+zb*cs;y=ya+(B[i*2+1]-ya)*e;x*=1+z*lens;y*=1+z*lens}
        const x2=x*cy+z*sy,z2=-x*sy+z*cy,y2=y*cp-z2*sp,z3=y*sp+z2*cp;
        if((z3<-.45?0:z3<.5?1:2)!==band)continue;
        g.fillRect(W/2+x2*U-sz/2,H/2+y2*U-sz/2,sz,sz)}}
    g.globalAlpha=1;requestAnimationFrame(frame)}
  addEventListener('resize',size);
  addEventListener('pointermove',e=>{if(still)return;yawTo=Math.max(-.5,Math.min(.5,yawTo+(e.movementX||0)*.0016));pitchTo=Math.max(-.3,Math.min(.3,pitchTo+(e.movementY||0)*.0012))});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{col=colours()});
  new MutationObserver(()=>{col=colours()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  size();requestAnimationFrame(frame);
  return api}
