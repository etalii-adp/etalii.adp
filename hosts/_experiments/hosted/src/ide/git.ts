/* The Git tool window: branch tree, commit graph with filters, commit details. */
import { $, $maybe, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { menuAt } from '../common/popups';
import { body } from './docks';
import { K } from './kinds';
import { byId, linkedRepos } from './model';
import { openDoc } from './open';
import { keep, S } from './state';
import { act, project, storage } from './storage';

/* the colour of each lane of the graph */
const LC = ['blue', 'green', 'orange'];

export function renderGit(): void {
  const b = body('git'), G = S.git, git = project.git, COMMITS = git.commits, at = new Map(COMMITS.map((cm, i) => [cm.h, i]));
  /* the commits a commit has behind it, itself included, by their place in the log */
  const reach = (i: number | undefined): Set<number> => {
    const s = new Set<number>();
    const go = (j: number | undefined): void => { if (j === undefined || s.has(j) || !COMMITS[j]) return; s.add(j); COMMITS[j].p.forEach(h => go(at.get(h))); };
    go(i);
    return s;
  };
  const again = (): void => { renderGit(); keep(); };
  if (!$maybe('.git', b)) {
    b.innerHTML = `<div class="git"><div class="g-br" id="g-br"></div><div class="g-log"><div class="g-bar"><input class="in" id="g-q" placeholder="Text or hash" aria-label="Search commits"><button class="tbtn" id="g-fb"></button><button class="tbtn" id="g-fu"></button><button class="tbtn" id="g-fd"></button><span class="sp"></span><button class="ib" id="g-fetch" title="Fetch all remotes">${ico('fetch')}</button></div><div class="g-rows" id="g-rows"></div></div><div class="g-det" id="g-det"></div></div>`;
    const search = $<HTMLInputElement>('#g-q', b), days: [number | null, string][] = [[null, 'Any time'], [1, 'Last 24 hours'], [7, 'Last 7 days']];
    search.oninput = () => { G.q = search.value.toLowerCase(); renderGit(); };
    $('#g-fb', b).onclick = e => menuAt(e.currentTarget as HTMLElement, [{ l: 'All branches', chk: !G.branch, on: () => { G.branch = null; again(); } }, '-', ...project.git.refs.map(r => ({ l: r.name, chk: G.branch === r.name, on: () => { G.branch = r.name; again(); } }))]);
    $('#g-fu', b).onclick = e => { const me = storage.identity.user.name; menuAt(e.currentTarget as HTMLElement, [{ l: 'Everyone', chk: !G.user, on: () => { G.user = null; again(); } }, { l: 'Me', chk: G.user === me, on: () => { G.user = me; again(); } }, '-', ...project.git.people.filter(u => u !== me).map(u => ({ l: u, chk: G.user === u, on: () => { G.user = u; again(); } }))]); };
    $('#g-fd', b).onclick = e => menuAt(e.currentTarget as HTMLElement, days.map(([v, l]) => ({ l, chk: G.days === v, on: () => { G.days = v; again(); } })));
    $('#g-fetch', b).onclick = () => void act(project.git.fetch());
    $('#g-br', b).onclick = e => { const r = hit(e, '[data-b]'); if (r) { G.branch = G.branch === r.dataset.b ? null : r.dataset.b!; again(); } };
    $('#g-rows', b).onclick = e => { const r = hit(e, '[data-c]'); if (r) { G.sel = Number(r.dataset.c); renderGit(); } };
  }
  const br = (k: string, label: string, icn = 'branch', extra = ''): string => `<div class="row${G.branch === k ? ' sel' : ''}" data-b="${esc(k)}" style="--d:0"><span class="tw"></span>${ico(icn, k === git.branch ? 'c-green' : 'c-muted')}<span class="nm">${esc(label)}</span>${extra}</div>`;
  const sync = `<span class="ref">${git.behind ? '↓' + git.behind : ''}${git.ahead ? ' ↑' + git.ahead : ''}${!git.behind && !git.ahead ? 'in sync' : ''}</span>`;
  /* the branch that is checked out leads its list */
  const of = (kind: string) => git.refs.filter(r => r.kind === kind).sort((x, y) => Number(y.name === git.branch) - Number(x.name === git.branch));
  $('#g-br', b).innerHTML = `<h5>Local</h5>${of('local').map(r => br(r.name, r.label, 'branch', r.name === git.branch ? sync : '')).join('')}<h5>Remote · origin</h5>${of('remote').map(r => br(r.name, r.label)).join('')}<h5>Tags</h5>${of('tag').map(r => br(r.name, r.label, 'tagi')).join('')}<h5>Linked repositories</h5>${linkedRepos().map(k => `<div class="row" style="--d:0" data-open="${k.id}"><span class="tw"></span>${ico('link', 'c-muted')}<span class="nm">${esc(k.name)}</span><span class="ref">${esc(k.link!.ref)}</span></div>`).join('')}`;
  $('#g-fb', b).innerHTML = `Branch: <b>${esc(G.branch || 'All')}</b>`;
  $('#g-fu', b).innerHTML = `User: <b>${esc(G.user || 'All')}</b>`;
  $('#g-fd', b).innerHTML = `Date: <b>${G.days ? 'Last ' + (G.days === 1 ? '24 hours' : '7 days') : 'All'}</b>`;
  const head = (name: string): number | undefined => at.get(git.refs.find(r => r.name === name)?.hash ?? '');
  const set = G.branch ? reach(head(G.branch)) : null, filtered = !!(G.q || G.user || G.days || G.branch);
  const vis = COMMITS.map((_, i) => i).filter(i => { const cm = COMMITS[i]; return (!set || set.has(i)) && (!G.user || cm.a === G.user) && (!G.days || cm.d < G.days) && (!G.q || cm.m.toLowerCase().includes(G.q) || cm.h.includes(G.q)); });
  const refs = (i: number): string => git.refs.filter(r => r.hash === COMMITS[i].h).map(r => `<span class="lbl c-${r.name === git.branch ? 'green' : r.kind === 'tag' ? 'yellow' : r.kind === 'remote' ? 'purple' : 'blue'}">${r.name === git.branch ? 'HEAD → ' : ''}${esc(r.name)}</span>`).join('');
  const RH = 26, X = (l: number) => 14 + l * 14, Y = (r: number) => r * RH + 13;
  let svg = '';
  /* the lines of the graph are drawn only when every commit shows */
  if (!filtered) vis.forEach(i => {
    const cm = COMMITS[i];
    cm.p.forEach(h => {
      const j = at.get(h);
      if (j === undefined) return;
      const a = cm.l, b2 = COMMITS[j].l, col = `var(--${LC[Math.max(a, b2)]})`, d = a === b2 ? `M${X(a)} ${Y(i)}L${X(a)} ${Y(j)}` : a < b2 ? `M${X(a)} ${Y(i)}C${X(a)} ${Y(i) + 13} ${X(b2)} ${Y(i) + 13} ${X(b2)} ${Y(i) + RH}L${X(b2)} ${Y(j)}` : `M${X(a)} ${Y(i)}L${X(a)} ${Y(j) - RH}C${X(a)} ${Y(j) - 13} ${X(b2)} ${Y(j) - 13} ${X(b2)} ${Y(j)}`;
      svg += `<path d="${d}" style="fill:none;stroke:${col};stroke-width:1.6"/>`;
    });
  });
  vis.forEach((i, r) => { const cm = COMMITS[i]; svg += `<circle cx="${X(filtered ? 0 : cm.l)}" cy="${Y(r)}" r="4" style="fill:var(--${LC[filtered ? 0 : cm.l]});stroke:var(--bg);stroke-width:1.5"/>`; });
  $('#g-rows', b).innerHTML = vis.length ? `<svg width="64" height="${vis.length * RH}">${svg}</svg>` + vis.map(i => { const cm = COMMITS[i]; return `<button class="g-row${G.sel === i ? ' on' : ''}" data-c="${i}">${refs(i)}<span class="msg">${esc(cm.m)}</span><span class="who">${esc(cm.a)}</span><span class="when">${esc(cm.w)}</span></button>`; }).join('') : '<div class="hint">No commits match these filters.</div>';
  const cm = COMMITS[G.sel] || COMMITS[0];
  $('#g-det', b).innerHTML = cm ? `<h6>${esc(cm.m)}</h6><p><span class="mono">${cm.h}</span> · ${esc(cm.a)} · ${esc(cm.w)}</p>${cm.touched.map(({ node: q, s }) => `<div>${ico(q.icon || K[q.kind].icon, 'c-' + K[q.kind].colour)}<span class="nm v${s}">${esc(q.name)}</span></div>`).join('')}` : '';
}

/* a linked repository in the branch tree opens that item */
export function mountGit(): void {
  body('git').addEventListener('click', e => { const x = byId(hit(e, '[data-open]')?.dataset.open ?? ''); if (x) openDoc(x); });
}
