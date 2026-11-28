/* The Git tool window: branch tree, commit graph with filters, commit details. */
import { h } from 'preact';
import { draw } from '../common/dom';
import { menuAt } from '../common/popups';
import { body } from './docks';
import { Git, type Graph, type RefRow } from './git.tsx';
import { byId, linkedRepos } from './model';
import { openDoc } from './open';
import { keep, S } from './state';
import { act, project, storage } from './storage';

/* the colour of each lane of the graph */
const LC = ['blue', 'green', 'orange'];
/* the ages the log can be kept to, in days */
const DAYS: readonly (readonly [days: number | null, label: string])[] = [[null, 'Any time'], [1, 'Last 24 hours'], [7, 'Last 7 days']];

export function renderGit(): void {
  const G = S.git, git = project.git, COMMITS = git.commits, at = new Map(COMMITS.map((cm, i) => [cm.h, i]));
  /* the commits a commit has behind it, itself included, by their place in the log */
  const reach = (i: number | undefined): Set<number> => {
    const s = new Set<number>();
    const go = (j: number | undefined): void => { if (j === undefined || s.has(j) || !COMMITS[j]) return; s.add(j); COMMITS[j].p.forEach(p => go(at.get(p))); };
    go(i);
    return s;
  };
  const again = (): void => { renderGit(); keep(); };
  const sync = `${git.behind ? '↓' + git.behind : ''}${git.ahead ? ' ↑' + git.ahead : ''}${!git.behind && !git.ahead ? 'in sync' : ''}`;
  /* the branch that is checked out leads its list, and says how far it is from its remote */
  const of = (kind: string, icon = 'branch'): RefRow[] => git.refs.filter(r => r.kind === kind).sort((x, y) => Number(y.name === git.branch) - Number(x.name === git.branch))
    .map(r => ({ name: r.name, label: r.label, icon, current: r.name === git.branch, selected: G.branch === r.name, note: kind === 'local' && r.name === git.branch ? sync : undefined }));
  const head = (name: string): number | undefined => at.get(git.refs.find(r => r.name === name)?.hash ?? '');
  const set = G.branch ? reach(head(G.branch)) : null, filtered = !!(G.q || G.user || G.days || G.branch);
  const vis = COMMITS.map((_, i) => i).filter(i => { const cm = COMMITS[i]; return (!set || set.has(i)) && (!G.user || cm.a === G.user) && (!G.days || cm.d < G.days) && (!G.q || cm.m.toLowerCase().includes(G.q) || cm.h.includes(G.q)); });
  const RH = 26, X = (l: number) => 14 + l * 14, Y = (r: number) => r * RH + 13;
  const graph: Graph = { lines: [], dots: vis.map((i, r) => ({ x: X(filtered ? 0 : COMMITS[i].l), y: Y(r), colour: `var(--${LC[filtered ? 0 : COMMITS[i].l]})` })), height: vis.length * RH };
  const lines: Graph['lines'][number][] = [];
  /* the lines of the graph are drawn only when every commit shows */
  if (!filtered) vis.forEach(i => {
    const cm = COMMITS[i];
    cm.p.forEach(p => {
      const j = at.get(p);
      if (j === undefined) return;
      const a = cm.l, b = COMMITS[j].l;
      lines.push({ colour: `var(--${LC[Math.max(a, b)]})`, d: a === b ? `M${X(a)} ${Y(i)}L${X(a)} ${Y(j)}` : a < b ? `M${X(a)} ${Y(i)}C${X(a)} ${Y(i) + 13} ${X(b)} ${Y(i) + 13} ${X(b)} ${Y(i) + RH}L${X(b)} ${Y(j)}` : `M${X(a)} ${Y(i)}L${X(a)} ${Y(j) - RH}C${X(a)} ${Y(j) - 13} ${X(b)} ${Y(j) - 13} ${X(b)} ${Y(j)}` });
    });
  });
  draw(body('git'), h(Git, {
    local: of('local'), remote: of('remote'), tags: of('tag', 'tagi'), linked: linkedRepos(),
    filters: { branch: G.branch || 'All', user: G.user || 'All', date: G.days ? 'Last ' + (G.days === 1 ? '24 hours' : '7 days') : 'All' },
    rows: vis.map(i => ({
      at: i, commit: COMMITS[i], selected: G.sel === i,
      labels: git.refs.filter(r => r.hash === COMMITS[i].h).map(r => ({ name: r.name, head: r.name === git.branch, colour: r.name === git.branch ? 'green' : r.kind === 'tag' ? 'yellow' : r.kind === 'remote' ? 'purple' : 'blue' })),
    })),
    graph: { ...graph, lines },
    shown: COMMITS[G.sel] || COMMITS[0],
    on: {
      search: text => { G.q = text.toLowerCase(); renderGit(); },
      branches: button => menuAt(button, [{ l: 'All branches', chk: !G.branch, on: () => { G.branch = null; again(); } }, '-', ...project.git.refs.map(r => ({ l: r.name, chk: G.branch === r.name, on: () => { G.branch = r.name; again(); } }))]),
      users: button => { const me = storage.identity.user.name; menuAt(button, [{ l: 'Everyone', chk: !G.user, on: () => { G.user = null; again(); } }, { l: 'Me', chk: G.user === me, on: () => { G.user = me; again(); } }, '-', ...project.git.people.filter(u => u !== me).map(u => ({ l: u, chk: G.user === u, on: () => { G.user = u; again(); } }))]); },
      dates: button => menuAt(button, DAYS.map(([v, l]) => ({ l, chk: G.days === v, on: () => { G.days = v; again(); } }))),
      fetch: () => void act(project.git.fetch()),
      keepTo: ref => { G.branch = G.branch === ref ? null : ref; again(); },
      select: commit => { G.sel = commit; renderGit(); },
      /* a linked repository in the branch tree opens that item */
      open: itemId => { const x = byId(itemId); if (x) openDoc(x); },
    },
  }));
}
