/* The four pictures the point cloud can be read as: text, a diagram, a hierarchy and knowledge. Each is a list of strokes in a box of -1.6..1.6 by -1..1; a stroke is [x1, y1, x2, y2, weight], and the weight says how densely it is dotted. */
'use strict';

const stroke=(a,x1,y1,x2,y2,w=1)=>{a.push([x1,y1,x2,y2,w])};
const frame=(a,cx,cy,w,h,wt=1)=>{const l=cx-w/2,r=cx+w/2,t=cy-h/2,b=cy+h/2;stroke(a,l,t,r,t,wt);stroke(a,r,t,r,b,wt);stroke(a,r,b,l,b,wt);stroke(a,l,b,l,t,wt)};
const ring=(a,cx,cy,r,wt=1)=>{const n=14;for(let i=0;i<n;i++){const p=i/n*Math.PI*2,q=(i+1)/n*Math.PI*2;stroke(a,cx+r*Math.cos(p),cy+r*Math.sin(p),cx+r*Math.cos(q),cy+r*Math.sin(q),wt)}};
const arrow=(a,x1,y1,x2,y2)=>{stroke(a,x1,y1,x2,y2,.8);const d=Math.atan2(y2-y1,x2-x1);for(const s of[-.45,.45])stroke(a,x2,y2,x2-.09*Math.cos(d+s),y2-.09*Math.sin(d+s),1.2)};

/* Text: lines of code, as indentation and the lengths of their words. */
function shapeText(){
  const a=[],rows=[[0,[.42,.3,.12]],[1,[.24,.5,.2]],[1,[.3,.18,.62]],[2,[.5,.26]],[2,[.2,.36,.3,.2]],[2,[.44,.12]],[1,[.14]],[0,[.1]],null,[0,[.34,.56,.12]],[1,[.3,.3,.46]],[2,[.62,.2]],[1,[.26,.4]],[0,[.1]]];
  rows.forEach((row,i)=>{if(!row)return;const y=-.91+i*.14;let x=-1.5+row[0]*.27;for(const len of row[1]){stroke(a,x,y-.011,x+len,y-.011);stroke(a,x,y+.011,x+len,y+.011);x+=len+.075}});
  return a}

/* Diagram: parts, and the flows between them. */
function shapeDiagram(){
  const a=[],W=.58,H=.32,B=[[-1.28,0],[-.42,-.56],[-.42,.56],[.44,0],[1.28,-.56],[1.28,.56]];
  B.forEach(([x,y])=>{frame(a,x,y,W,H);stroke(a,x-.17,y-.03,x+.17,y-.03,.7);stroke(a,x-.17,y+.06,x+.05,y+.06,.5)});
  for(const[i,j]of[[0,1],[0,2],[1,3],[2,3],[3,4],[3,5]])arrow(a,B[i][0]+W/2,B[i][1],B[j][0]-W/2-.02,B[j][1]);
  return a}

/* Hierarchy: the whole at the top, the detail below. */
function shapeHierarchy(){
  const a=[],node=(x,y,w,h)=>{frame(a,x,y,w,h);stroke(a,x-w*.28,y,x+w*.28,y,.6);return[x,y,h]};
  const link=(p,kids)=>{const my=(p[1]+p[2]/2+kids[0][1]-kids[0][2]/2)/2;stroke(a,p[0],p[1]+p[2]/2,p[0],my,.8);
    stroke(a,Math.min(p[0],kids[0][0]),my,Math.max(p[0],kids[kids.length-1][0]),my,.8);kids.forEach(k=>stroke(a,k[0],my,k[0],k[1]-k[2]/2,.8))};
  const root=node(0,-.82,.56,.2),l1=[-1.05,0,1.05].map(x=>node(x,-.3,.46,.18));link(root,l1);
  const l2=[[-1.33,-.77],[-.3,.3],[.77,1.33]].map(xs=>xs.map(x=>node(x,.24,.38,.16)));l1.forEach((p,i)=>link(p,l2[i]));
  link(l2[0][1],[-.92,-.62].map(x=>node(x,.8,.24,.14)));link(l2[1][1],[.15,.45].map(x=>node(x,.8,.24,.14)));link(l2[2][1],[1.18,1.48].map(x=>node(x,.8,.24,.14)));
  return a}

/* Knowledge: things, and what connects them, for people and AI to reason over. */
function shapeKnowledge(){
  const a=[],N=[[0,0,.17],[-.95,-.56,.1],[-1.32,.14,.08],[-.72,.6,.11],[-.1,-.76,.09],[.56,-.6,.12],[1.16,-.3,.08],[1.36,.42,.1],[.66,.56,.1],[.05,.8,.07],[-.47,-.16,.07],[.52,.04,.07]];
  N.forEach(([x,y,r],i)=>{ring(a,x,y,r,1.3);if(!i)ring(a,x,y,r*.5,1)});
  for(const[i,j]of[[0,10],[0,11],[0,4],[0,9],[0,3],[0,8],[10,1],[1,2],[2,3],[1,4],[4,5],[11,5],[5,6],[6,7],[7,8],[11,7],[8,9]]){
    const[x1,y1,r1]=N[i],[x2,y2,r2]=N[j],d=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/d,uy=(y2-y1)/d;stroke(a,x1+ux*r1,y1+uy*r1,x2-ux*r2,y2-uy*r2,.75)}
  return a}
