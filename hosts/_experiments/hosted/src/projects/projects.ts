/* The project overview: search, the two lists, and opening a project. */
import { $, $$, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { go, pageReady } from '../common/nav';
import { startStored } from '../common/away';
import { startPage } from '../common/page';
import { reason } from '../common/reason';
import { toast } from '../common/popups';
import { connect, visit } from '../storage';

async function start(): Promise<void> {
  startPage();
  const { catalogue, identity, projects } = await connect();
  await Promise.all([catalogue.load(), identity.load(), projects.load()]);

  /* the list that shows: every project, or the assets among them */
  let list: 'all' | 'reuse' = 'all';
  const search = $<HTMLInputElement>('#pj-q');
  $('#pj-ver').textContent = catalogue.product;
  $('#pj-me').innerHTML = `<span class="avatar" style="margin:0">${esc(identity.user.initials)}</span> ${esc(identity.user.name)} <span>Sign out</span>`;
  $('#pj-me').onclick = () => { void identity.signOut().catch(() => undefined); };

  function renderProjects(): void {
    const q = search.value.trim().toLowerCase(), rows = projects.list.filter(p => (list === 'all' || p.asset) && (!q || p.name.toLowerCase().includes(q)));
    $('#pj-n1').textContent = String(projects.list.length);
    $('#pj-n2').textContent = String(projects.list.filter(p => p.asset).length);
    $$('[data-pf]').forEach(b => b.classList.toggle('on', b.dataset.pf === list));
    $('#pj-list').innerHTML = rows.map(p => `<button class="pj-row" data-p="${p.id}"><span class="av" style="background:var(--${esc(p.colour)})">${esc(p.initials)}</span><span class="pj-t"><b>${esc(p.name)}</b><small>${esc(p.about)}</small><small class="mono">${esc(p.path)}</small></span><span class="pj-m">${p.errors ? `<span class="chip">${ico('error', 'c-red')}${p.errors}</span>` : ''}<span class="chip">${ico('branch')}${esc(p.branch)}</span><span class="when">${esc(p.opened)}</span></span></button>`).join('') || `<div class="hint">${projects.list.length ? 'No project matches that search.' : 'There are no projects yet.'}</div>`;
  }

  search.oninput = renderProjects;
  $('#pj-list').onclick = e => {
    const id = hit(e, '[data-p]')?.dataset.p;
    if (!id) return;
    /* the IDE page opens the project the visit remembers */
    projects.open(id).then(() => { visit.set('project', id); go('ide'); }, (err: unknown) => toast(reason(err)));
  };
  document.addEventListener('click', e => {
    const f = hit(e, '[data-pf]');
    if (f) { list = f.dataset.pf as typeof list; renderProjects(); }
  });

  renderProjects();
  pageReady();
}

startStored(start);
