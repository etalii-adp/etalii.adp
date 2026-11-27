/* The project overview: search, the two lists, and opening a project. */
import { $, $$, hit } from '../common/dom';
import { ico } from '../common/icons';
import { go, pageReady } from '../common/nav';
import { only, startPage } from '../common/page';
import { projects } from './data/projects';

startPage();

/* the list that shows: every project, or the assets among them */
let list: 'all' | 'reuse' = 'all';
const search = $<HTMLInputElement>('#pj-q');

function renderProjects(): void {
  const q = search.value.trim().toLowerCase(), rows = projects.filter(p => (list === 'all' || p.asset) && (!q || p.name.toLowerCase().includes(q)));
  $('#pj-n1').textContent = String(projects.length);
  $('#pj-n2').textContent = String(projects.filter(p => p.asset).length);
  $$('[data-pf]').forEach(b => b.classList.toggle('on', b.dataset.pf === list));
  $('#pj-list').innerHTML = rows.map(p => `<button class="pj-row" data-p="${p.name}"><span class="av" style="background:var(--${p.colour})">${p.initials}</span><span class="pj-t"><b>${p.name}</b><small>${p.about}</small><small class="mono">${p.path}</small></span><span class="pj-m">${p.name === 'Atlas Platform' ? `<span class="chip">${ico('error', 'c-red')}2</span>` : ''}<span class="chip">${ico('branch')}${p.branch}</span><span class="when">${p.opened}</span></span></button>`).join('') || '<div class="hint">No project matches that search.</div>';
}

search.oninput = renderProjects;
$('#pj-list').onclick = e => {
  const row = hit(e, '[data-p]');
  if (!row) return;
  if (row.dataset.p === 'Atlas Platform') go('ide'); else only();
};
document.addEventListener('click', e => {
  const f = hit(e, '[data-pf]');
  if (f) { list = f.dataset.pf as typeof list; renderProjects(); }
});

renderProjects();
pageReady();
