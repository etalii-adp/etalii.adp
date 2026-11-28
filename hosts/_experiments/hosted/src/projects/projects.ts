/* The project overview: search, the two lists, and opening a project. */
import { h } from 'preact';
import { $, $$, draw, hit } from '../common/dom';
import { go, pageReady } from '../common/nav';
import { startStored } from '../common/away';
import { startPage } from '../common/page';
import { reason } from '../common/reason';
import { toast } from '../common/popups';
import { connect, visit } from '../storage';
import { ProjectRows, SignedIn } from './projects.template';
import { openWizard } from './wizard';

async function start(): Promise<void> {
  startPage();
  const storage = await connect(), { catalogue, identity, projects } = storage;
  await Promise.all([catalogue.load(), identity.load(), projects.load()]);

  /* the list that shows: every project, or the assets among them */
  let list: 'all' | 'reuse' = 'all';
  const search = $<HTMLInputElement>('#pj-q');
  $('#pj-ver').textContent = catalogue.product;
  draw($('#pj-me'), h(SignedIn, { user: identity.user }));
  $('#pj-me').onclick = () => { void identity.signOut().catch(() => undefined); };

  /* the IDE page opens the project the visit remembers */
  const open = (id: string): void => { projects.open(id).then(() => { visit.set('project', id); go('ide'); }, (err: unknown) => toast(reason(err))); };
  function renderProjects(): void {
    const q = search.value.trim().toLowerCase(), rows = projects.list.filter(p => (list === 'all' || p.asset) && (!q || p.name.toLowerCase().includes(q)));
    $('#pj-n1').textContent = String(projects.list.length);
    $('#pj-n2').textContent = String(projects.list.filter(p => p.asset).length);
    $$('[data-pf]').forEach(b => b.classList.toggle('on', b.dataset.pf === list));
    draw($('#pj-list'), h(ProjectRows, { rows, any: projects.list.length > 0, open }));
  }

  search.oninput = renderProjects;
  /* a new project starts with the wizard; what it asks comes from the storage, so the button waits for it, as it waited for the page */
  const add = $<HTMLButtonElement>('#pj-new');
  add.disabled = false;
  add.onclick = () => {
    add.disabled = true;
    openWizard(storage).catch((err: unknown) => toast(reason(err))).finally(() => { add.disabled = false; });
  };
  /* a project that was made in another window is listed here as well */
  projects.onChange(renderProjects);
  document.addEventListener('click', e => {
    const f = hit(e, '[data-pf]');
    if (f) { list = f.dataset.pf as typeof list; renderProjects(); }
  });

  renderProjects();
  pageReady();
}

startStored(start);
