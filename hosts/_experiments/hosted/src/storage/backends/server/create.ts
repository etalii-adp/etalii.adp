/* The New Project wizard: what it asks, and making a project of the answers. The recipes a person kept become the hierarchy of the project: each puts its elements in an area, and a group two recipes share is made once. Nothing in such a project is written yet, but a brief of what the wizard was told. */
import { create } from '@bufbuild/protobuf';
import { Refused } from '../../backend';
import type { TextDocument } from '../../documents';
import { Catalogue, type ProjectWizard, type Recipe, type RecipeElement } from '../../gen/adp/storage/v1/catalogue_pb';
import { RefKind } from '../../gen/adp/storage/v1/git_pb';
import { KeptProjectSchema } from '../../gen/adp/storage/v1/kept_pb';
import { Projects, ProjectSchema, ProjectsSnapshotSchema } from '../../gen/adp/storage/v1/projects_pb';
import { ItemSchema, type Item } from '../../gen/adp/storage/v1/solution_pb';
import { newGitHash, newShortGuid } from '../../ids';
import { projectWizard } from '../catalogue';
import type { Call, World } from './core';
import { slug } from './project';

/* the colours a new project's badge gets, by turns */
const COLOURS = ['teal', 'orange', 'purple', 'green', 'blue', 'red'];

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string): string => s.replace(/[&<>"]/g, ch => entities[ch]);
/* two letters for a badge: the first letters of the first two words, or of the one word */
const initialsOf = (name: string): string => { const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean); return ((words.length > 1 ? words[0][0] + words[1][0] : words[0]?.slice(0, 2)) ?? 'P').toUpperCase(); };

/* whether a recipe is offered for a size and the options that were chosen */
export const fits = (recipe: Recipe, sizeId: string, chosen: ReadonlySet<string>): boolean => (!recipe.sizes.length || recipe.sizes.includes(sizeId)) && recipe.needs.every(id => chosen.has(id));

/* tells every page that the list of projects changed */
export function tellProjects(world: World, call: Call): void {
  world.projects.revision++;
  world.server.emit('Projects', '', world.projects.revision, call, ProjectsSnapshotSchema, world.projects);
}

export function serveCreate(world: World): void {
  const { server } = world;
  let wizard: ProjectWizard | null = null;
  const asked = (): ProjectWizard => wizard ??= projectWizard();

  server.on(Catalogue.method.readProjectWizard, () => asked());

  server.on(Projects.method.create, (r, call) => {
    const name = r.name.trim().replace(/\s+/g, ' '), w = asked(), size = w.sizes.find(s => s.id === r.sizeId), chosen = new Set(r.optionIds);
    if (!name) throw new Refused('invalid', 'A project needs a name.');
    if (/[\\/:*?"<>|]/.test(name)) throw new Refused('invalid', 'A name cannot contain \\ / : * ? " < > |');
    if (world.projects.projects.some(p => p.name.toLowerCase() === name.toLowerCase())) throw new Refused('taken', `There is already a project called "${name}".`);
    if (!size) throw new Refused('invalid', 'Choose what kind of solution it is.');
    /* only what is offered for the answers is made, in the order the wizard lists it */
    const recipes = w.recipes.filter(x => fits(x, size.id, chosen) && r.recipeIds.includes(x.id));

    const items: Item[] = [], documents: { itemId: string; revision: number; text: string }[] = [];
    const byId = new Map<string, Item>(), children = (x: Item): Item[] => x.children.map(id => byId.get(id)!);
    const make = (parent: Item | null, init: { name: string; kind: string; icon?: string; file?: string; accepts?: string[]; container?: boolean }): Item => {
      let unique = init.name, n = 2;
      while (parent && children(parent).some(k => k.name.toLowerCase() === unique.toLowerCase())) unique = `${init.name} ${n++}`;
      const x = create(ItemSchema, { id: newShortGuid(), parentId: parent?.id ?? '', ...init, name: unique, fresh: !init.container });
      items.push(x); byId.set(x.id, x); parent?.children.push(x.id);
      return x;
    };
    const put = (parent: Item, e: RecipeElement): void => {
      const kind = world.kinds.get(e.kind);
      if (!kind) return;
      const accepts = e.accepts.length ? e.accepts : kind.takes, level = accepts.length > 0 || e.children.length > 0;
      /* a group that is there already takes what this recipe brings for it */
      const same = e.kind === 'group' ? children(parent).find(k => k.kind === 'group' && k.name === e.name) : undefined;
      const x = same ?? make(parent, { name: e.name, kind: e.kind, icon: e.icon, file: e.file, accepts: [...accepts], container: level });
      if (same) x.accepts = [...new Set([...x.accepts, ...accepts])];
      /* a model starts with an empty document, as one that is added in the Explorer does */
      if (!same && kind.tool === 'onto') documents.push({ itemId: x.id, revision: 1, text: JSON.stringify({ entities: {}, relations: [] }) });
      for (const child of e.children) put(x, child);
    };

    const root = make(null, { name, kind: 'solution', accepts: ['area', 'group', 'doc'], container: true });
    for (const area of w.areas) {
      const mine = recipes.filter(x => x.area === area.name);
      if (!mine.length) continue;
      const level = make(root, { name: area.name, kind: 'area', icon: area.icon, accepts: [...area.accepts], container: true });
      for (const recipe of mine) for (const e of recipe.elements) put(level, e);
    }

    /* what the wizard was told, as the first document of the project */
    const brief = make(root, { name: w.brief, kind: 'doc' });
    brief.fresh = false;
    const answers = w.questions.map(q => [q.title, q.options.filter(o => chosen.has(o.id)).map(o => o.label)] as const).filter(([, labels]) => labels.length);
    documents.push({
      itemId: brief.id, revision: 1, text: JSON.stringify({
        html: `<h1>${esc(name)}</h1><p>${esc(name)} was started as ${/^[aeiou]/i.test(size.label) ? 'an' : 'a'} ${esc(size.label.toLowerCase())}. ${esc(size.about)}</p>`
          + (answers.length ? `<h2>What it is built with</h2><ul>${answers.map(([title, labels]) => `<li><strong>${esc(title)}</strong>: ${esc(labels.join(', '))}</li>`).join('')}</ul>` : '')
          + (recipes.length ? `<h2>The recipes it started from</h2><p>Each recipe put its elements in the hierarchy. They are yours to compose from here: rename them, move them, and add what is missing with New in the Explorer.</p><ul>${recipes.map(x => `<li><strong>${esc(x.name)}</strong>, in ${esc(x.area)}. ${esc(x.about)}</li>`).join('')}</ul>` : '<p>No recipe was chosen, so the hierarchy starts empty. New, in the Explorer, adds the first area.</p>'),
      } satisfies TextDocument),
    });

    const made = items.filter(x => x.parentId && x.kind !== 'area').length - 1, user = world.seed.user.name || 'You', first = newGitHash();
    const about = create(ProjectSchema, {
      id: newShortGuid(), name, initials: initialsOf(name), colour: COLOURS[world.projects.projects.length % COLOURS.length],
      path: r.path.trim() || '~/git/' + slug(name), branch: r.branch.trim() || 'main', opened: 'Just now',
      about: `${size.label} · ${made} ${made === 1 ? 'item' : 'items'} from ${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`,
    });
    const levels = children(root).filter(x => x.container);
    world.adoptMade(create(KeptProjectSchema, {
      seed: world.seed.version, made: about,
      solution: { revision: 1, rootId: root.id, path: about.path.split('/').pop() || slug(name), items },
      levels: { revision: 1 },
      git: { revision: 1, branch: about.branch, upstream: 'origin/' + about.branch, fetched: 'Never fetched', people: [user], refs: [{ name: about.branch, label: about.branch, kind: RefKind.LOCAL, hash: first }], commits: [{ hash: first, message: `Start ${name} from ${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`, author: user, when: 'Just now' }] },
      status: { revision: 1 },
      workbench: { selectedId: root.id, documentId: root.id, tabIds: [root.id, brief.id], expandedIds: [root.id, ...levels.map(x => x.id)] },
      contentRevision: 1, documents,
    }));
    world.projects.lastOpenedId = about.id;
    world.server.changed.add(about.id);
    tellProjects(world, call);
    return { project: about };
  });
}
