/* The example data as a seed: the Atlas Platform of an energy utility, with its user, its projects, its git log and the text of everything in it. Every example name and number is in this folder and nowhere else. */
import type { MessageInitShape } from '@bufbuild/protobuf';
import type { CheckDocument, DashboardDocument, FormDocument, FormField, OntologyDocument, PageDocument, PageSection, SchemaDocument, SectionType, TextDocument } from '../../documents';
import { Author } from '../../gen/adp/storage/v1/agent_pb';
import { ChangeState, RefKind } from '../../gen/adp/storage/v1/git_pb';
import type { KeptProjectSchema } from '../../gen/adp/storage/v1/kept_pb';
import { ViewMode, type LevelSchema } from '../../gen/adp/storage/v1/levels_pb';
import type { ItemSchema } from '../../gen/adp/storage/v1/solution_pb';
import type { Item } from '../../gen/adp/storage/v1/solution_pb';
import { Severity as ProblemSeverity } from '../../gen/adp/storage/v1/status_pb';
import { gitHashOf, shortGuidOf } from '../../ids';
import type { ProjectState, World } from '../server/core';
import { childrenOf, disk, kindOf, parentOf, showsAll, slug, viewOf } from '../server/project';
import type { Seed } from '../server/seed';
import { HOLDS, SOURCES } from './applications';
import { changed } from './changes';
import { CHECK, CHECKK } from './checks';
import { CODE } from './code';
import { COMMITS, HEADS, WHO } from './commits';
import { talks } from './conversations';
import { DASH } from './dashboards';
import { DOC } from './documents';
import type { Draft, Severity, Vcs } from './draft';
import { FLOW, FLOWK } from './flows';
import { FORM } from './forms';
import { ONTO } from './ontology';
import { PAGE } from './pages';
import { found } from './problems';
import { projects } from './projects';
import { SCHEMA, SCHEMAD, SUSED } from './schemas';
import { solution } from './solution';

type ItemInit = MessageInitShape<typeof ItemSchema>;
type LevelInit = MessageInitShape<typeof LevelSchema>;

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: unknown): string => String(s).replace(/[&<>"]/g, ch => entities[ch]);
const stateOf = (v: Vcs | undefined): ChangeState => v === 'A' ? ChangeState.ADDED : v === 'M' ? ChangeState.MODIFIED : ChangeState.UNSPECIFIED;
const severityOf: Record<Severity, ProblemSeverity> = { error: ProblemSeverity.ERROR, warning: ProblemSeverity.WARNING, info: ProblemSeverity.INFO };

const projectId = (name: string): string => shortGuidOf('project/' + name);
/* the one project that opens */
const ATLAS = projectId(solution.name);

/* The hierarchy as it starts: every item with an id made from its place, so it has the same id on every load. Each ontology model carries its entity types as child items, so the hierarchy and the diagram show the same things. */
interface Start { items: ItemInit[]; levels: LevelInit[]; marks: [id: string, state: ChangeState][]; names: Map<string, string>; byName: Map<string, string> }
function start(): Start {
  const items: ItemInit[] = [], levels: LevelInit[] = [], marks: Start['marks'] = [], models: ItemInit[] = [];
  const adopt = (draft: Draft, parentId: string, place: string): string => {
    const id = shortGuidOf(place), x: ItemInit = { id, name: draft.name, kind: draft.kind, parentId, container: !!draft.children, icon: draft.icon ?? '', accepts: draft.accepts ?? [], file: draft.file ?? '', files: draft.files ?? [], ignoredFiles: draft.ignoredFiles ?? [] };
    if (draft.link) x.link = { repository: draft.link.repo, ref: draft.link.ref, refs: draft.link.refs, resolved: gitHashOf(draft.link.ref + draft.name) };
    items.push(x);
    if (draft.vcs) marks.push([id, stateOf(draft.vcs)]);
    const children = (draft.children ?? []).map(k => adopt(k, id, place + '/' + k.name));
    x.children = children;
    x.flows = (draft.flows ?? []).map(([a, b]) => ({ fromId: children[a], toId: children[b] }));
    if (draft.mode || draft.layout0) levels.push({ itemId: id, view: draft.mode === 'files' ? ViewMode.FILES : draft.mode === 'logical' ? ViewMode.LOGICAL : ViewMode.UNSPECIFIED, layout: (draft.layout0 ?? []).map(([px, py], i) => ({ itemId: children[i], x: px, y: py })) });
    if (draft.kind === 'ontology') models.push(x);
    return id;
  };
  adopt(solution, '', 'atlas');
  for (const model of models) {
    const made = (ONTO[model.name!]?.e ?? []).map(([name, , , , ext]): ItemInit => ({ id: entityId(model.id!, name), name, kind: 'entity', parentId: model.id, icon: ext ? 'link' : '' }));
    model.container = true;
    model.accepts = ['entity'];
    model.children = made.map(e => e.id!);
    items.push(...made);
  }
  const names = new Map(items.map(x => [x.id!, x.name!])), byName = new Map<string, string>();
  for (const x of items) if (!byName.has(x.name!)) byName.set(x.name!, x.id!);
  return { items, levels, marks, names, byName };
}
const entityId = (modelId: string, name: string): string => shortGuidOf('entity/' + modelId + '/' + name);

const STARTED = start();
/* what the project overview says of the one project that opens: counted, so it agrees with what validation counts */
const count = (is: (x: ItemInit) => boolean): number => STARTED.items.filter(is).length;
const ABOUT = `Platform · ${count(x => x.kind === 'area')} areas, ${count(x => !!x.parentId && x.kind !== 'entity')} items · ${count(x => !!x.link)} linked repositories`;
/* the name an item had when the example was made: what it holds is looked up by that name, so renaming an item does not change what it holds */
const first = (x: Item): string => STARTED.names.get(x.id) ?? '';
/* the id of the item that had a name in the example, if it is still there */
const idOf = (state: ProjectState, name: string): string => { const id = STARTED.byName.get(name); return id && state.items.has(id) ? id : ''; };

function atlas(): MessageInitShape<typeof KeptProjectSchema> {
  const { items, levels, marks, byName } = STARTED, id = (name: string): string => byName.get(name) ?? '';
  const hashes = COMMITS.map(c => c.h), touched = [['Meter readings to Bronze', 'M'], ['Pipelines', 'M'], ['Data quality rules', 'M']] as [string, Vcs][];
  return {
    solution: { revision: 1, rootId: items[0].id, items, path: 'atlas-platform', suggestedLink: { repository: example.suggestedLink.repository, ref: example.suggestedLink.refs[0], refs: example.suggestedLink.refs }, suggestedLinkName: example.suggestedLink.name, suggestedLinkParentId: id('Components') },
    levels: { revision: 1, levels },
    git: {
      revision: 1, branch: 'develop', upstream: 'origin/develop', ahead: 1, behind: 3, fetched: 'Fetched 4 min ago', people: WHO, suggestedMessage: 'Add tariff classes and the outage map page',
      refs: Object.entries(HEADS).map(([name, at]) => ({ name, label: name.replace(/^origin\//, ''), kind: /^v\d/.test(name) ? RefKind.TAG : name.startsWith('origin/') ? RefKind.REMOTE : RefKind.LOCAL, hash: hashes[at] })),
      commits: COMMITS.map(c => ({ hash: c.h, lane: c.l, parents: c.p.map(i => hashes[i]), message: c.m, author: c.a, when: c.w, days: c.d, touched: touched.slice(0, c.p.length > 1 ? 1 : 3).map(([name, s]) => ({ itemId: id(name), state: stateOf(s) })) })),
      changes: changed.map(([name, files]) => ({ itemId: id(name), files: files.map(([path, s]) => ({ path, state: stateOf(s) })) })),
      items: marks.map(([itemId, state]) => { const h = parseInt(itemId.slice(-6), 36); return { itemId, state, lastAuthor: WHO[h % 4], lastDays: h % 9 + 2 }; }),
    },
    status: {
      revision: 1, problems: found.map(([s, message, at]) => ({ severity: severityOf[s], message, itemId: id(at) })),
      environments: [{ name: 'Staging', healthy: true, note: 'Staging healthy' }], defaultRunId: id('Deploy to staging'),
    },
    workbench: {
      selectedId: items[0].id, documentId: items[0].id,
      tabIds: [items[0].id!, id('Meter readings to Bronze'), id('Asset model'), id('Home')],
      expandedIds: ['Atlas Platform', 'Ingestion', 'Sources', 'Pipelines', 'Ontology', 'Asset model', 'Components'].map(id),
    },
    contentRevision: 1,
    agent: {
      revision: 1,
      conversations: talks.map((t, at) => {
        const messages = t.said.map((m, i) => ({ id: shortGuidOf(`agent/${at}/${i}`), author: m.mine ? Author.USER : Author.AGENT, text: m.text, time: m.time, itemIds: (m.items ?? []).map(id).filter(Boolean), steps: m.steps ?? [] }));
        return { about: { id: shortGuidOf(`agent/${at}`), title: t.title, day: t.day, time: t.time, messages: messages.length, last: cutLine(t.said.at(-1)!.text) }, messages };
      }),
    },
  };
}
/* the start of a text, as a list of conversations shows what was said last */
const cutLine = (text: string): string => { const line = text.replace(/\s+/g, ' '); return line.length > 90 ? line.slice(0, line.lastIndexOf(' ', 90)) + '…' : line; };

/* the text of a level's .adp file, or of its .user.adp file */
function adpText(state: ProjectState, o: Item, world: World, user: boolean): string {
  const children = childrenOf(state, o);
  return user ? `# Your personal overrides for ${o.name}. Ignored by git, so they stay on this computer.\nview: ${viewOf(state, o) === ViewMode.FILES ? 'files' : 'logical'}\nshowAllFiles: ${showsAll(state, o)}\ncanvas:\n  layout:\n${children.slice(0, 3).map((k, i) => `    ${k.id}: { x: ${i * 300 + 40}, y: ${i % 2 * 120 + 20} }   # ${k.name}`).join('\n') || '    {}'}`
    : `# Shared settings for ${o.name}. Committed with the project.\nid: ${o.id}\nname: "${o.name}"\nkind: ${o.kind}\nicon: ${o.icon || kindOf(world, o).icon}\nview: logical            # logical or files\nshowAllFiles: false\n${o.link ? `link:\n  repository: "${o.link.repository}"\n  ref: "${o.link.ref}"\n` : ''}children:\n${children.map(k => `  - id: ${k.id}            # ${k.name}`).join('\n') || '  []'}\ncanvas:\n  layout:\n${children.map((k, i) => `    ${k.id}: { x: ${i % 3 * 300}, y: ${Math.floor(i / 3) * 210} }`).join('\n') || '    {}'}`;
}

/* the text an editor shows for an item */
function codeText(x: Item, world: World): string {
  const was = first(x);
  if (x.fresh) return '';
  if (x.kind === 'csharp' || x.kind === 'python') return SOURCES[disk(world, x)] ?? '';
  if (CODE[was]) return CODE[was];
  if (x.kind === 'vocabulary') return `# ${x.name}, a SKOS vocabulary used by the ontology\n@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n@prefix atlas: <https://atlas.example.com/vocab/> .\n\natlas:${slug(x.name)} a skos:ConceptScheme ;\n  skos:prefLabel "${x.name}" .\n\natlas:residential a skos:Concept ;\n  skos:inScheme atlas:${slug(x.name)} ;\n  skos:prefLabel "Residential" .\n\natlas:commercial a skos:Concept ;\n  skos:inScheme atlas:${slug(x.name)} ;\n  skos:prefLabel "Commercial" .`;
  if (x.kind === 'prompt') return `# ${x.name}\n\nYou write for customers of an energy company.\n\nGiven the outage record below, write two sentences:\n1. What happened and where, in plain words.\n2. When power is expected back, only if the record has an estimate.\n\nNever guess a cause. Never promise a time the record does not contain.`;
  if (x.kind === 'notebook') return `# ${x.name}\nimport pandas as pd\n\nactual = pd.read_sql("select * from silver.system_load", atlas)\nforecast = pd.read_sql("select * from gold.load_forecast", atlas)\n\nerror = (forecast.load_mw - actual.load_mw).abs() / actual.load_mw\nerror.groupby(actual.read_at.dt.hour).mean().plot()   # error per hour of day`;
  return `-- ${x.name}\nselect 1`;
}

/* what each section of a page is called */
const SECTION_NAMES: Record<SectionType, string> = { nav: 'Header', hero: 'Hero', cards: 'Card grid', map: 'Map', chart: 'Chart', form: 'Form', table: 'Table', footer: 'Footer', title: 'Heading', drop: 'Empty section' };

/* one section of a portal page, as it will look */
function section(t: SectionType, x: Item): string {
  const was = first(x);
  switch (t) {
    case 'nav': return `<div class="b-nav" style="display:flex"><b>Atlas Energy</b><span>Home</span><span>Outage map</span><span>My usage</span><span>Report an outage</span><span class="fake">Sign in</span></div>`;
    case 'hero': return `<div class="b-hero" style="margin:-14px -20px"><h2>Is the power on in your street?</h2><p>Check live outages, follow repairs and see when power is expected back.</p><div class="rowf"><span class="fin">Postcode</span><span class="fake">Check</span></div></div>`;
    case 'cards': return `<div class="b-cards"><div><b>3 active outages</b><p>Affecting 412 homes in the North region</p></div><div><b>My usage</b><p>7.4 kWh today, 12% below last week</p></div><div><b>Report a problem</b><p>Tell us about an outage or a damaged cable</p></div></div>`;
    case 'title': return `<h2>${esc(x.name)}</h2><p>${was === 'Outage map' ? 'Live outages and planned work in your region.' : was === 'My usage' ? 'Your electricity use per day, from your smart meter.' : was === 'Admin console' ? 'Open reports and their handling status.' : 'Tell us what you see. We reply within the hour.'}</p>`;
    case 'map': return `<div class="b-map"><svg viewBox="0 0 600 190"><path d="M30 40l120-20 90 40 60-30 130 20 120 60-60 70-170 0-90-30-120 20-70-50z" fill="#dfe7ee" stroke="#c3ced9"/><path d="M150 20l90 40-20 60-110 10M300 30l-20 90 110 40M430 50l-60 100" fill="none" stroke="#c3ced9"/><g fill="#d6453d"><circle cx="190" cy="80" r="7"/><circle cx="330" cy="120" r="7"/><circle cx="470" cy="100" r="7"/></g><g fill="#e0a100"><circle cx="110" cy="110" r="5"/><circle cx="400" cy="70" r="5"/></g></svg>${was === 'Outage map' ? `<span class="warnb">No data binding. Bind this map to Grid topology to show live outages.</span>` : ''}</div>`;
    case 'table': return `<table class="ptable"><thead><tr><th>Area</th><th>Since</th><th>Homes</th><th>Status</th><th>Expected back</th></tr></thead><tbody><tr><td>North, Elm Park</td><td>09:12</td><td>236</td><td>Crew on site</td><td>12:30</td></tr><tr><td>North, Harbour Road</td><td>10:40</td><td>148</td><td>Fault located</td><td>13:15</td></tr><tr><td>South, Mill Lane</td><td>11:05</td><td>28</td><td>Reported</td><td>To be confirmed</td></tr></tbody></table>`;
    case 'chart': return `<div class="pbars" style="margin-bottom:20px">${([['Mon', 62], ['Tue', 71], ['Wed', 58], ['Thu', 80], ['Fri', 66], ['Sat', 92], ['Sun', 74]] as [string, number][]).map(([dn, v]) => `<div style="height:${v}%"><span>${dn}</span></div>`).join('')}</div>`;
    case 'form': return `<div class="b-form"><label>Postcode<span class="fin">1234 AB</span></label><label>House number<span class="fin">12</span></label><label>What do you see?<span class="fin">No power in the whole street</span></label><label>Contact number<span class="fin">Optional</span></label></div><p style="margin-top:12px"><span class="fake">${was === 'Sign-in page' ? 'Sign in' : 'Send report'}</span></p>`;
    case 'footer': return `<div>Atlas Energy · Privacy · Accessibility · Contact</div>`;
    default: return `<div>Drag a component here.</div>`;
  }
}
function pageDocument(state: ProjectState, x: Item): PageDocument {
  const empty: SectionType[] = ['nav', 'drop'], types = x.fresh ? empty : PAGE[first(x)] || empty, ds = state.items.get(idOf(state, 'Design system'));
  const sections = types.map((type): PageSection => {
    const unbound = type === 'map' && first(x) === 'Outage map';
    return { type, name: SECTION_NAMES[type], html: section(type, x), unbound, binding: unbound ? 'None' : type === 'table' || type === 'map' || type === 'chart' || type === 'cards' ? 'Data analysis / Outage heatmap' : 'Static', refresh: type === 'table' || type === 'map' ? 'Every 60 s' : 'On load' };
  });
  return { sections, components: [...(ds ? childrenOf(state, ds).filter(k => k.kind === 'component').map(k => k.name) : []), 'Table', 'Footer'], from: 'Design system @ ' + (ds?.link?.ref ?? '') };
}

function ontologyDocument(state: ProjectState, x: Item): OntologyDocument {
  const O = x.fresh ? undefined : ONTO[first(x)], doc: OntologyDocument = { entities: {}, relations: [] };
  if (!O) return doc;
  const ids = O.e.map(([name]) => entityId(x.id, name));
  O.e.forEach(([, ex, ey, attrs, ext], i) => { if (state.items.has(ids[i])) doc.entities[ids[i]] = { attrs: [...attrs], x: ex, y: ey, ...(ext ? { ext } : {}) }; });
  doc.relations = O.r.filter(([a, b]) => state.items.has(ids[a]) && state.items.has(ids[b])).map(([a, b, label]) => [ids[a], ids[b], label]);
  return doc;
}

function formDocument(state: ProjectState, x: Item): FormDocument {
  const made = FORM[x.kind as keyof typeof FORM]?.(x) ?? [['General', [['Name', 'text', x.name], ['Owner', 'text', 'Platform team']]]];
  return { sections: made.map(([title, fields]) => [title, fields.map((f): FormField => f[1] === 'ref' ? [f[0], 'ref', f[2] as string, idOf(state, f[2] as string)] : f as FormField)]) };
}

function textDocument(state: ProjectState, x: Item): TextDocument {
  const folder = parentOf(state, x)?.name ?? '', runbook = folder === 'Runbooks';
  if (x.fresh) return { html: `<h1>${esc(x.name)}</h1><p style="color:var(--dim)">Start writing…</p>` };
  return { html: DOC[first(x)] || `<h1>${esc(x.name)}</h1><p>This ${runbook ? 'runbook' : 'document'} belongs to ${esc(folder)} in Atlas Platform.</p><h2>${runbook ? 'First response' : 'Summary'}</h2><ul><li>Check the Data quality monitor for the affected source.</li><li>Open the pipeline in its diagram and look for a step marked in red.</li><li>Re-run the pipeline on Staging before touching Production.</li></ul><h2>Who to call</h2><p>Grid data team during office hours, the operations rota outside them.</p>` };
}

export const example: Seed = {
  version: 'atlas-2',
  workspace: 'atlas.example.com',
  user: { id: shortGuidOf('user/sam.rivera'), name: WHO[0], email: 'sam.rivera@example.com', initials: 'SR' },
  password: '42!',
  answerMs: 900,
  providers: ['GitHub', 'GitLab', 'Bitbucket', 'Azure DevOps'],
  projects: projects.map(p => ({ id: projectId(p.name), name: p.name, initials: p.initials, colour: p.colour, path: p.path, branch: p.branch, about: projectId(p.name) === ATLAS ? ABOUT : p.about, opened: p.opened, asset: p.asset, errors: projectId(p.name) === ATLAS ? found.filter(f => f[0] === 'error').length : 0 })),
  lastOpenedId: ATLAS,
  project: about => about.id === ATLAS ? atlas() : `Only ${solution.name} is available on this computer.`,

  document(state, x, world) {
    const tool = kindOf(world, x).tool, was = first(x);
    if (tool === 'flow') return JSON.stringify(x.fresh ? { nodes: [], edges: [] } : FLOW[was] || FLOWK[x.kind as keyof typeof FLOWK] || { nodes: [], edges: [] });
    if (tool === 'onto') return JSON.stringify(ontologyDocument(state, x));
    if (tool === 'schema') return JSON.stringify({ fields: x.fresh ? [] : SCHEMA[was] || SCHEMAD, settings: { format: was.includes('Bronze') || was.includes('Silver') ? 'Parquet' : 'JSON', version: '3', compat: 'Backward' }, usedBy: (SUSED[was] || []).map(name => idOf(state, name)).filter(Boolean) } satisfies SchemaDocument);
    if (tool === 'page') return JSON.stringify(pageDocument(state, x));
    if (tool === 'dash') return JSON.stringify({ note: 'Reads from Silver · refreshed 2 min ago', ...(DASH[was] || DASH['Load forecast overview']) } satisfies DashboardDocument);
    if (tool === 'form') return JSON.stringify(formDocument(state, x));
    if (tool === 'check') return JSON.stringify({ rows: x.fresh ? [] : CHECK[was] || CHECKK[x.kind as keyof typeof CHECKK] || [], lastRun: 'last run today 09:15 on Staging' } satisfies CheckDocument);
    if (tool === 'doc') return JSON.stringify(textDocument(state, x));
    if (tool === 'code') return codeText(x, world);
    return '';
  },

  file(state, owner, path, world) {
    const name = path.split('/').pop() ?? path, holds = name === '.adp' ? 'Shared settings and canvas layout' : name === '.user.adp' ? 'Your personal overrides' : HOLDS[name] ?? '';
    if (name in SOURCES) return { text: SOURCES[name], holds, syntax: /\.(cs|py|sql)$/.test(name) ? '' : 'settings' };
    if (name === '.adp') return { text: adpText(state, owner, world, false), holds };
    if (name === '.user.adp') return { text: adpText(state, owner, world, true), holds };
    if (name.endsWith('.sql')) return { text: `-- Stored form of ${owner.name}. Edit it through its diagram in Logical Structure view.\nselect meter_id, read_at, value_kwh\nfrom bronze.meter_readings\nwhere quality = 'ok'`, holds };
    return { text: `# ${name}\n# Stored form of ${owner.name}. Edit it through its tool in Logical Structure view.\nitem: ${owner.id}\nname: "${owner.name}"\nkind: ${owner.kind}`, holds };
  },

  suggestedLink: { repository: 'git@git.example.com:shared/notification-service.git', name: 'Notification service', refs: ['v1.4.0', 'v1.3.2', 'main'] },
  repository: () => ({ icon: 'chat', refs: ['v1.4.0', 'v1.3.2', 'main'], items: [{ name: 'Email template', kind: 'component' }, { name: 'Delivery pipeline', kind: 'pipeline' }, { name: 'Delivery monitor', kind: 'dashboard' }] }),
  sinceFetch: '4 minutes ago',
  environment: 'Staging',
};
