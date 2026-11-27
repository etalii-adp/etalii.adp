/* The start page: the point cloud, the names of its four pictures, and the way in. */
import { $, $$, hit } from '../common/dom';
import { pageReady } from '../common/nav';
import { startPage } from '../common/page';
import { makeCloud, type Rgb } from './cloud';
import { shapeDiagram, shapeHierarchy, shapeKnowledge, shapeText, type Stroke } from './shapes';

startPage();

const SEEN: [name: string, line: string, picture: Stroke[]][] = [
  ['Text', 'Written down, line by line.', shapeText()],
  ['Diagram', 'Drawn, as parts and the flows between them.', shapeDiagram()],
  ['Hierarchy', 'Organised, from the whole down to the detail.', shapeHierarchy()],
  ['Knowledge', 'Connected, so people and AI can reason over it.', shapeKnowledge()]];

/* the cloud takes its colours from the theme, so it follows dark and light */
const rgbOf = (name: string): Rgb => {
  const h = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace('#', '');
  return h.length === 3 ? [...h].map(ch => parseInt(ch + ch, 16)) : [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};
const cloud = makeCloud($<HTMLCanvasElement>('#cloud'), SEEN.map(s => s[2]), () => ({ views: ['--fg', '--blue', '--green', '--purple'].map(rgbOf), accent: rgbOf('--mark') }));

const pick = $('#sp-pick'), line = $('#sp-line');
pick.innerHTML = SEEN.map((s, i) => `<button data-i="${i}" aria-pressed="${!i}" class="${i ? '' : 'on'}">${s[0]}</button>`).join('');
cloud.onturn = i => {
  $$('button', pick).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
  line.classList.add('out');
  setTimeout(() => { line.textContent = SEEN[i][1]; line.classList.remove('out'); }, 260);
};
line.textContent = SEEN[0][1];
pick.onclick = e => { const b = hit(e, 'button'); if (b) cloud.show(Number(b.dataset.i), true); };
const turn = () => cloud.show((cloud.index + 1) % SEEN.length, true);
$('#cloud').onclick = turn;
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') turn();
  if (e.key === 'ArrowLeft') cloud.show((cloud.index + SEEN.length - 1) % SEEN.length, true);
});

pageReady();
