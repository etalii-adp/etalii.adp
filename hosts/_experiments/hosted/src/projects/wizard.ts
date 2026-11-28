/* The New Project wizard. It asks what is being built, from a console application up to a solution on a platform as a service, what it is built with, and what it needs beside its code. The answers bring recipes: sets of elements that belong together. The recipes a person keeps become the hierarchy of the new project, which is composed further in the IDE. */
import { h, type ComponentChild } from 'preact';
import { $, $maybe, drop, raise, redraw } from '../common/dom';
import { addIcons } from '../common/icons';
import { go } from '../common/nav';
import { reason } from '../common/reason';
import { visit, type RecipeElementInfo, type RecipeInfo, type Storage } from '../storage';
import { many, Naming, NoRecipes, Questions, Recipes, Sizes, Wizard, type Level } from './wizard.template';

const STEPS = [
  { id: 'size', label: 'Solution', title: 'What are you building?', about: 'From one application to a whole solution on a platform. It decides what the next steps ask.' },
  { id: 'technology', label: 'Technology', title: 'What is it built with?', about: 'Choose everything that applies. Each choice brings recipes for the hierarchy.' },
  { id: 'delivery', label: 'Delivery and quality', title: 'What does it need beside its code?', about: 'Choose everything that applies.' },
  { id: 'recipes', label: 'Recipes', title: 'Which recipes does it start from?', about: 'A recipe is a set of elements that belong together. The ones you keep become the hierarchy, where you compose them further.' },
  { id: 'name', label: 'Name and location', title: 'What is it called?', about: 'Every project is a git repository.' },
] as const;
type StepId = typeof STEPS[number]['id'];

/* the path a project gets when none is given: the storage makes the same of the name */
const folderOf = (name: string): string => '~/git/' + (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project');

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

  /* What a step asks. Each step is a piece of the page of its own (its key), so a step never takes over the fields or the focus of the one before it. */
  function body(id: StepId): ComponentChild {
    if (id === 'size') return h(Sizes, { key: id, sizes: catalogue.sizes, sizeId, choose: pickSize, press: pressSize });
    if (id === 'technology' || id === 'delivery') return h(Questions, { key: id, asked: catalogue.questionsFor(sizeId).filter(q => q.step === id), chosen: options, toggle: toggleOption });
    if (id === 'recipes') {
      const all = offered(), root = catalogue.kind('solution'), brief = catalogue.kind('doc');
      if (!all.length) return h(NoRecipes, { key: id });
      return h(Recipes, { key: id, areas: catalogue.areas, offered: all, aside, kept: kept().length, tree: hierarchy(), name, root, brief: { name: catalogue.brief, icon: brief.icon, colour: brief.colour }, toggle: toggleRecipe, all: keepAll });
    }
    const asked = catalogue.questionsFor(sizeId).map(q => [q.title, q.options.filter(o => options.has(o.id)).map(o => o.label)] as const).filter(([, labels]) => labels.length);
    return h(Naming, { key: id, name, path, branch, folder: folderOf(name), refused, icon: size()!.icon, summary: summary(), asked, typed });
  }

  /* the wizard as it is now */
  function view(): ComponentChild {
    const at = STEPS[step];
    return h(Wizard, {
      labels: STEPS.map(s => s.label), step, reached, sized: !!sizeId, title: at.title, about: at.about, at: at.id, body: body(at.id),
      note: at.id === 'size' ? '' : at.id === 'name' ? '' : at.id === 'recipes' ? summary() : size()?.label ?? '', busy, on: { close, back, step: goTo, next },
    });
  }

  function render(focus = true): void {
    const at = STEPS[step];
    reached = Math.max(reached, step);
    const scroll = $maybe('.wz-recs', v)?.scrollTop ?? 0;
    redraw(v, view());
    const list = $maybe('.wz-recs', v);
    if (list) list.scrollTop = scroll;
    if (!focus) return;
    if (at.id === 'name') { const field = $<HTMLInputElement>('#wz-name', v); field.focus(); field.select(); }
    else ($maybe('.wz-size.on', v) ?? $maybe('.wz-body button', v) ?? $('[data-next]', v)).focus();
  }
  /* draws the step again and leaves the focus on what was clicked */
  function show(selector: string): void { render(false); $maybe(selector, v)?.focus(); }

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

  /* while a project is being made, a click changes nothing */
  const idle = <A extends unknown[]>(does: (...args: A) => void) => (...args: A): void => { if (!busy) does(...args); };
  const close = idle(() => drop(v));
  const back = idle(() => { step = Math.max(0, step - 1); render(); });
  const goTo = idle((to: number) => { step = to; render(); });
  /* a second click on a kind of solution goes on with it */
  const pickSize = idle((id: string, again: boolean) => { choose(id); if (again) { step = 1; render(); } else show(`[data-size="${id}"]`); });
  const toggleOption = idle((id: string) => { if (!options.delete(id)) options.add(id); show(`[data-opt="${id}"]`); });
  const toggleRecipe = idle((id: string) => { if (!aside.delete(id)) aside.add(id); show(`[data-rec="${id}"]`); });
  const keepAll = idle((all: boolean) => { aside.clear(); if (!all) for (const x of offered()) aside.add(x.id); show(`[data-all="${all ? '1' : ''}"]`); });
  /* the kinds of solution are one choice: the arrow keys go from one to the next, and Enter goes on with the one that has the focus */
  function pressSize(id: string, key: string): boolean {
    if (busy) return false;
    const ids = catalogue.sizes.map(s => s.id), i = ids.indexOf(id);
    const to = key === 'ArrowRight' || key === 'ArrowDown' ? ids[i + 1] : key === 'ArrowLeft' || key === 'ArrowUp' ? ids[i - 1] : key === 'Enter' ? id : undefined;
    if (!to) return false;
    choose(to);
    if (key === 'Enter') { step = 1; render(); } else show(`[data-size="${to}"]`);
    return true;
  }
  /* what is typed in a field of the last step; a name that was refused is no longer said to be */
  function typed(field: 'name' | 'path' | 'branch', value: string): void {
    if (field === 'path') path = value;
    else if (field === 'branch') branch = value;
    else { name = value; refused = ''; redraw(v, view()); }
  }
  function next(): void {
    if (busy || !sizeId) return;
    if (step < STEPS.length - 1) { step++; render(); return; }
    if (!name.trim()) { refused = 'A project needs a name.'; render(); return; }
    void createProject();
  }

  const v: HTMLElement = raise(view());
  render();
}
