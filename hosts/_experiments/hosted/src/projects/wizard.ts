/* The New Project wizard. It asks what is being built, from a console application up to a solution on a platform as a service, what it is built with, and what it needs beside its code. The answers bring recipes: sets of elements that belong together. The recipes a person keeps become the hierarchy of the new project, which is composed further in the IDE. */
import { $, $maybe, el, esc, hit } from '../common/dom';
import { addIcons, ico } from '../common/icons';
import { go } from '../common/nav';
import { reason } from '../common/reason';
import { visit, type RecipeElementInfo, type RecipeInfo, type Storage } from '../storage';

const STEPS = [
  { id: 'size', label: 'Solution', title: 'What are you building?', about: 'From one application to a whole solution on a platform. It decides what the next steps ask.' },
  { id: 'technology', label: 'Technology', title: 'What is it built with?', about: 'Choose everything that applies. Each choice brings recipes for the hierarchy.' },
  { id: 'delivery', label: 'Delivery and quality', title: 'What does it need beside its code?', about: 'Choose everything that applies.' },
  { id: 'recipes', label: 'Recipes', title: 'Which recipes does it start from?', about: 'A recipe is a set of elements that belong together. The ones you keep become the hierarchy, where you compose them further.' },
  { id: 'name', label: 'Name and location', title: 'What is it called?', about: 'Every project is a git repository.' },
] as const;
type StepId = typeof STEPS[number]['id'];

/* one line of the hierarchy a project would start with */
interface Level { name: string; kind: string; icon: string; colour: string; children: Level[] }

/* the path a project gets when none is given: the storage makes the same of the name */
const folderOf = (name: string): string => '~/git/' + (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project');
const many = (n: number, one: string, more = one + 's'): string => `${n} ${n === 1 ? one : more}`;

/* Opens the wizard. What it asks is read from the storage when it opens for the first time. */
export async function openWizard(storage: Storage): Promise<void> {
  const { catalogue, projects } = storage;
  await Promise.all([catalogue.loadWizard(), catalogue.icons.count ? undefined : catalogue.loadIcons()]);
  addIcons(catalogue.icons.drawings);

  let step = 0, reached = 0, sizeId = '', busy = false, refused = '';
  let name = '', path = '', branch = 'main';
  const options = new Set<string>();
  /* every recipe that is offered is kept, but the ones that were put aside */
  const aside = new Set<string>();

  const size = () => catalogue.sizes.find(s => s.id === sizeId);
  const offered = (): readonly RecipeInfo[] => sizeId ? catalogue.recipesFor(sizeId, options) : [];
  const kept = (): RecipeInfo[] => offered().filter(r => !aside.has(r.id));

  /* the hierarchy the recipes that are kept make: an area for each that has something, and a group two recipes share once */
  function hierarchy(): Level[] {
    const mine = kept(), areas: Level[] = [];
    const put = (parent: Level, e: RecipeElementInfo): void => {
      const kind = catalogue.kinds[e.kind];
      if (!kind) return;
      let x = e.kind === 'group' ? parent.children.find(k => k.kind === 'group' && k.name === e.name) : undefined;
      if (!x) {
        let unique = e.name, n = 2;
        while (parent.children.some(k => k.name.toLowerCase() === unique.toLowerCase())) unique = `${e.name} ${n++}`;
        x = { name: unique, kind: e.kind, icon: e.icon || kind.icon, colour: kind.colour, children: [] };
        parent.children.push(x);
      }
      for (const child of e.children) put(x, child);
    };
    for (const area of catalogue.areas) {
      const recipes = mine.filter(r => r.area === area.name);
      if (!recipes.length) continue;
      const level: Level = { name: area.name, kind: 'area', icon: area.icon || catalogue.kind('area').icon, colour: catalogue.kind('area').colour, children: [] };
      for (const r of recipes) for (const e of r.elements) put(level, e);
      areas.push(level);
    }
    return areas;
  }
  const countOf = (list: readonly Level[]): number => list.reduce((n, x) => n + 1 + countOf(x.children), 0);
  /* what the project will say of itself in the list */
  const summary = (): string => { const s = size(); return s ? `${s.label} · ${many(hierarchy().reduce((n, a) => n + countOf(a.children), 0), 'item')} from ${many(kept().length, 'recipe')}` : ''; };

  const box = (on: boolean): string => `<span class="wz-box">${on ? ico('check') : ''}</span>`;
  const optionsOf = (stepId: 'technology' | 'delivery'): string => {
    const asked = catalogue.questionsFor(sizeId).filter(q => q.step === stepId);
    return asked.map(q => `<fieldset class="wz-q"><legend><b>${esc(q.title)}</b><small>${esc(q.about)}</small></legend><div class="wz-opts">${q.options.map(o => `<button type="button" class="wz-opt${options.has(o.id) ? ' on' : ''}" role="checkbox" aria-checked="${options.has(o.id)}" data-opt="${esc(o.id)}">${box(options.has(o.id))}<span><b>${esc(o.label)}</b><small>${esc(o.about)}</small></span></button>`).join('')}</div></fieldset>`).join('');
  };
  const rows = (list: readonly Level[], depth: number): string => list.map(x => `<div class="wz-row" style="--d:${depth}">${ico(x.icon, 'c-' + x.colour)}<span>${esc(x.name)}</span></div>${rows(x.children, depth + 1)}`).join('');

  function body(id: StepId): string {
    if (id === 'size') return `<div class="wz-sizes" role="radiogroup" aria-label="Kind of solution">${catalogue.sizes.map(s => `<button type="button" class="wz-size${s.id === sizeId ? ' on' : ''}" role="radio" aria-checked="${s.id === sizeId}" data-size="${esc(s.id)}"><span class="wz-top">${ico(s.icon)}<span class="wz-scale" title="Size ${s.scale} of ${catalogue.sizes.length}">${catalogue.sizes.map((_, i) => `<i${i < s.scale ? ' class="on"' : ''}></i>`).join('')}</span></span><b>${esc(s.label)}</b><small>${esc(s.about)}</small><span class="wz-parts">${s.parts.map(p => `<span class="chip">${esc(p)}</span>`).join('')}</span></button>`).join('')}</div>`;
    if (id === 'technology' || id === 'delivery') return optionsOf(id);
    if (id === 'recipes') {
      const all = offered(), tree = hierarchy();
      if (!all.length) return `<div class="hint">No recipe fits these answers, so the hierarchy starts empty. Go back to choose more, or go on and add the first area in the Explorer.</div>`;
      const list = catalogue.areas.map(a => {
        const mine = all.filter(r => r.area === a.name);
        return mine.length ? `<h4>${ico(a.icon)}${esc(a.name)}</h4>${mine.map(r => { const on = !aside.has(r.id); return `<button type="button" class="wz-rec${on ? ' on' : ''}" role="checkbox" aria-checked="${on}" data-rec="${esc(r.id)}">${box(on)}<span><b>${esc(r.name)}</b><small>${esc(r.about)}</small></span><span class="wz-count">${many(r.count, 'item')}</span></button>`; }).join('')}` : '';
      }).join('');
      return `<div class="wz-two"><div class="wz-recs"><div class="wz-all"><span>${many(kept().length, 'recipe')} of ${all.length}</span><button type="button" data-all="1">Select all</button><button type="button" data-all="">Select none</button></div>${list}</div>`
        + `<div class="wz-tree" aria-label="The hierarchy the project starts with"><h4>Hierarchy</h4><div class="wz-row root" style="--d:0">${ico(catalogue.kind('solution').icon, 'c-' + catalogue.kind('solution').colour)}<span>${name ? esc(name) : 'New project'}</span></div>${rows(tree, 1)}<div class="wz-row" style="--d:1">${ico(catalogue.kind('doc').icon, 'c-' + catalogue.kind('doc').colour)}<span>${esc(catalogue.brief)}</span></div></div></div>`;
    }
    const s = size()!, asked = catalogue.questionsFor(sizeId).map(q => [q.title, q.options.filter(o => options.has(o.id)).map(o => o.label)] as const).filter(([, labels]) => labels.length);
    return `<div class="wz-form"><label for="wz-name">Name</label><input class="in" id="wz-name" maxlength="60" autocomplete="off" spellcheck="false" value="${esc(name)}"${refused ? ' aria-invalid="true" aria-describedby="wz-err"' : ''}>`
      + `<p class="wz-err" id="wz-err" role="alert"${refused ? '' : ' hidden'}>${esc(refused)}</p>`
      + `<label for="wz-path">Location</label><input class="in mono" id="wz-path" autocomplete="off" spellcheck="false" value="${esc(path)}" placeholder="${esc(folderOf(name))}">`
      + `<label for="wz-branch">Branch</label><input class="in mono" id="wz-branch" autocomplete="off" spellcheck="false" value="${esc(branch)}" placeholder="main"></div>`
      + `<div class="wz-sum"><h4>${ico(s.icon)}${esc(summary())}</h4>${asked.map(([title, labels]) => `<div class="wz-ans"><span>${esc(title)}</span><span>${labels.map(l => `<span class="chip">${esc(l)}</span>`).join('')}</span></div>`).join('')}</div>`;
  }

  const v = el(`<div class="veil"><form class="wz" role="dialog" aria-modal="true" aria-labelledby="wz-t" novalidate><aside class="wz-steps"><h2>New Project</h2><ol></ol></aside><div class="wz-main"><header><h3 id="wz-t"></h3><p></p></header><div class="wz-body"></div><footer><span class="wz-note"></span><button type="button" class="btn" data-x>Cancel</button><button type="button" class="btn" data-back>Back</button><button class="btn pri" data-next></button></footer></div></form></div>`);
  const form = $<HTMLFormElement>('form', v);

  function render(focus = true): void {
    const at = STEPS[step], last = step === STEPS.length - 1;
    reached = Math.max(reached, step);
    $('ol', v).innerHTML = STEPS.map((s, i) => `<li><button type="button" class="wz-step${i === step ? ' on' : ''}${i < step ? ' done' : ''}" data-step="${i}"${i === step ? ' aria-current="step"' : ''}${i > reached || (i > 0 && !sizeId) ? ' disabled' : ''}><span class="wz-n">${i < step ? ico('check') : i + 1}</span>${esc(s.label)}</button></li>`).join('');
    $('#wz-t', v).textContent = at.title;
    $('header p', v).textContent = at.about;
    const scroll = $maybe('.wz-recs', v)?.scrollTop ?? 0;
    $('.wz-body', v).innerHTML = body(at.id);
    $('.wz-body', v).dataset.at = at.id;
    const list = $maybe('.wz-recs', v);
    if (list) list.scrollTop = scroll;
    $('.wz-note', v).textContent = at.id === 'size' ? '' : at.id === 'name' ? '' : at.id === 'recipes' ? summary() : size()?.label ?? '';
    $<HTMLButtonElement>('[data-back]', v).hidden = step === 0;
    const next = $<HTMLButtonElement>('[data-next]', v);
    next.textContent = last ? (busy ? 'Creating…' : 'Create Project') : 'Next';
    next.disabled = busy || !sizeId;
    if (!focus) return;
    if (at.id === 'name') { const field = $<HTMLInputElement>('#wz-name', v); field.focus(); field.select(); }
    else ($maybe('.wz-size.on', v) ?? $maybe('.wz-body button', v) ?? next).focus();
  }
  /* draws the step again and leaves the focus on what was clicked */
  function redraw(selector: string): void { render(false); $maybe(selector, v)?.focus(); }

  function choose(id: string): void {
    if (id === sizeId) return;
    const s = catalogue.sizes.find(x => x.id === id);
    if (!s) return;
    /* another kind of solution starts from what is usual for it */
    sizeId = id; options.clear(); aside.clear(); reached = 0;
    for (const o of s.suggests) options.add(o);
  }

  async function createProject(): Promise<void> {
    busy = true; refused = '';
    render(false);
    try {
      const made = await projects.create({ name, path, branch, sizeId, optionIds: [...options], recipeIds: kept().map(r => r.id) });
      /* the IDE page opens the project the visit remembers */
      visit.set('project', made.id);
      go('ide');
    } catch (e) {
      busy = false;
      /* the storage says why not, under the name */
      try { refused = reason(e); } finally { render(); }
    }
  }

  v.addEventListener('click', e => {
    if (busy) return;
    if (hit(e, '[data-x]')) { v.remove(); return; }
    if (hit(e, '[data-back]')) { step = Math.max(0, step - 1); render(); return; }
    const to = hit(e, '[data-step]');
    if (to) { step = Number(to.dataset.step); render(); return; }
    const s = hit(e, '[data-size]');
    /* a second click on a kind of solution goes on with it */
    if (s) { choose(s.dataset.size!); if (e.detail > 1) { step = 1; render(); } else redraw(`[data-size="${s.dataset.size}"]`); return; }
    const o = hit(e, '[data-opt]');
    if (o) { const id = o.dataset.opt!; if (!options.delete(id)) options.add(id); redraw(`[data-opt="${id}"]`); return; }
    const r = hit(e, '[data-rec]');
    if (r) { const id = r.dataset.rec!; if (!aside.delete(id)) aside.add(id); redraw(`[data-rec="${id}"]`); return; }
    const all = hit(e, '[data-all]');
    if (all) { aside.clear(); if (!all.dataset.all) for (const x of offered()) aside.add(x.id); redraw(`[data-all="${all.dataset.all}"]`); }
  });
  /* the kinds of solution are one choice: the arrow keys go from one to the next, and Enter goes on with the one that has the focus */
  v.addEventListener('keydown', e => {
    const at = hit(e, '[data-size]');
    if (!at || busy) return;
    const cards = [...v.querySelectorAll<HTMLElement>('[data-size]')], i = cards.indexOf(at);
    const to = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? cards[i + 1] : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? cards[i - 1] : e.key === 'Enter' ? at : undefined;
    if (!to) return;
    e.preventDefault();
    choose(to.dataset.size!);
    if (e.key === 'Enter') { step = 1; render(); } else redraw(`[data-size="${to.dataset.size}"]`);
  });
  v.addEventListener('input', e => {
    const field = e.target as HTMLInputElement;
    if (field.id === 'wz-name') {
      name = field.value;
      $<HTMLInputElement>('#wz-path', v).placeholder = folderOf(name);
      if (refused) { refused = ''; $('#wz-err', v).hidden = true; field.removeAttribute('aria-invalid'); }
    } else if (field.id === 'wz-path') path = field.value;
    else if (field.id === 'wz-branch') branch = field.value;
  });
  form.onsubmit = e => {
    e.preventDefault();
    if (busy || !sizeId) return;
    if (step < STEPS.length - 1) { step++; render(); return; }
    if (!name.trim()) { refused = 'A project needs a name.'; render(); return; }
    void createProject();
  };

  document.body.append(v);
  render();
}
