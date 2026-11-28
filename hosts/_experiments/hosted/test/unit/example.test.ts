/* The example data as its YAML files have it: every name a file uses finds one item, and the project they describe opens with every item's document readable. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { example } from '../../src/storage/backends/example';
import { data } from '../../src/storage/backends/example/gen/data';
import type { Choice, ItemData } from '../../src/storage/backends/example/shape';
import { makeWorld } from '../../src/storage/backends/server';
import { kindOf } from '../../src/storage/backends/server/project';

/* how often each name is an item's: the hierarchy, and the entity types of the models in it */
const named = new Map<string, number>();
const count = (name: string): void => { named.set(name, (named.get(name) ?? 0) + 1); };
const walk = (x: ItemData): void => { count(x.name); x.children?.forEach(walk); };
walk(data.solution.root);
const every = <T>(choice: Choice<T>): T[] => typeof choice === 'object' && choice !== null && !Array.isArray(choice) && 'otherwise' in choice ? [...Object.values(choice.items), choice.otherwise] : [choice as T];

test('every item a file names is one item of the hierarchy', () => {
  const { git, status, workbench, agent, workspace, forms, schemas, pages } = data;
  const uses: [where: string, name: string][] = [
    ...git.commits.flatMap(c => c.touched.map((t): [string, string] => ['git.yaml commits', t.item])),
    ...git.changes.map((c): [string, string] => ['git.yaml changes', c.item]),
    ...git.items.map((x): [string, string] => ['git.yaml items', x.item]),
    ...status.problems.map((p): [string, string] => ['status.yaml problems', p.item]),
    ['status.yaml defaultRun', status.defaultRun],
    ['workbench.yaml selected', workbench.selected], ['workbench.yaml document', workbench.document],
    ...[...workbench.tabs, ...workbench.expanded].map((name): [string, string] => ['workbench.yaml', name]),
    ...agent.conversations.flatMap(c => c.messages.flatMap(m => (m.items ?? []).map((name): [string, string] => ['agent.yaml', name]))),
    ['workspace.yaml suggestedLink', workspace.suggestedLink.under],
    ...[...Object.values(forms.kinds), forms.otherwise].flatMap(sections => sections!.flatMap(s => s.fields.filter(f => f[1] === 'ref').flatMap(f => every(f[2]).map((name): [string, string] => ['forms.yaml', name as string])))),
    ...Object.values(schemas.usedBy).flat().map((name): [string, string] => ['schemas.yaml usedBy', name]),
    ['pages.yaml library', pages.library.item],
  ];
  assert.ok(uses.length > 100, 'the files name fewer items than they did');
  for (const [where, name] of uses) assert.equal(named.get(name), 1, `${where}: "${name}" is the name of ${named.get(name) ?? 'no'} items`);
});

test('what the files say an item holds is said of an item that is there, of a kind that is there', () => {
  const { flows, checks, code, documents, dashboards, ontology, schemas, pages, forms, workspace } = data, world = makeWorld(example);
  const held: [file: string, names: string[]][] = [
    ['flows.yaml', Object.keys(flows.items)], ['checks.yaml', Object.keys(checks.items)], ['code.yaml', Object.keys(code.items)], ['documents.yaml', Object.keys(documents.items)],
    ['dashboards.yaml', [...Object.keys(dashboards.items), dashboards.otherwise]], ['ontology.yaml', Object.keys(ontology.models)],
    ['schemas.yaml', [...Object.keys(schemas.items), ...Object.keys(schemas.usedBy), ...every(schemas.settings.format).length > 1 ? Object.keys((schemas.settings.format as { items: object }).items) : []]],
    ['pages.yaml', [...Object.keys(pages.items), ...Object.keys(pages.unbound.sections), ...Object.values(pages.sections).flatMap(s => Object.values(s.parts ?? {}).flatMap(c => typeof c === 'object' ? Object.keys(c.items) : []))]],
    ['forms.yaml', [...Object.values(forms.kinds), forms.otherwise].flatMap(sections => sections!.flatMap(s => s.fields.flatMap(f => typeof f[2] === 'object' && !Array.isArray(f[2]) ? Object.keys(f[2].items) : [])))],
  ];
  for (const [file, names] of held) for (const name of names) assert.ok(named.has(name), `${file}: no item is called "${name}"`);
  const kinds = [...Object.keys(flows.kinds), ...Object.keys(checks.kinds), ...Object.keys(code.kinds), ...Object.keys(forms.kinds), pages.library.kind, ...workspace.linkedRepository.items.map(i => i.kind)];
  for (const kind of kinds) assert.ok(world.kinds.has(kind), `no kind is called "${kind}"`);
  for (const [name, model] of Object.entries(ontology.models)) {
    const entities = new Set(model.entities.map(e => e.name));
    assert.equal(entities.size, model.entities.length, `${name}: two entity types share a name`);
    for (const r of model.relations) assert.ok(entities.has(r.from) && entities.has(r.to), `${name}: a relation names an entity type that is not there`);
  }
  assert.ok(workspace.projects.some(p => p.name === workspace.opens), 'the project that opens is not one of the projects');
});

test('the project the files describe opens, and every item in it has a document its tool can read', () => {
  const world = makeWorld(example), state = world.project(example.lastOpenedId);
  let items = 0;
  const walked = (x: ItemData): void => { items++; x.children?.forEach(walked); };
  walked(data.solution.root);
  assert.equal(state.items.size, items + Object.entries(data.ontology.models).reduce((n, [, m]) => n + m.entities.length, 0), 'the hierarchy has other items than the files');
  for (const x of state.items.values()) {
    const text = example.document(state, x, world), tool = kindOf(world, x).tool;
    assert.ok(!/\{\{\w+\}\}/.test(text), `${x.name}: a part of its document was not filled in`);
    if (['flow', 'onto', 'schema', 'page', 'dash', 'form', 'check', 'doc'].includes(tool)) assert.doesNotThrow(() => { JSON.parse(text); }, `${x.name}: its document is not what its tool reads`);
    for (const file of [...x.files, ...x.ignoredFiles, '.adp', 'notes.txt', 'query.sql']) assert.ok(!/\{\{\w+\}\}/.test(example.file(state, x, file, world).text ?? ''), `${x.name}/${file}: a part of the file was not filled in`);
  }
  const about = example.projects.find(p => p.id === example.lastOpenedId)!.about!;
  assert.match(about, /^Platform · \d+ areas, \d+ items · \d+ linked repositories$/);
});
