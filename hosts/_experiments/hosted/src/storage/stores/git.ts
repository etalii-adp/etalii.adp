/* Git: the branch and how far it is from its upstream, the log, the changes that are not committed, and what git says of each item. */
import { fromBinary } from '@bufbuild/protobuf';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import { ChangeState, Git, GitSnapshotSchema, RefKind, type GitSnapshot } from '../gen/adp/storage/v1/git_pb';
import type { Link } from '../link';
import type { Change, Commit, Done, GitRef, Item, Vcs, Writable } from '../views';
import type { SolutionStore } from './solution';

const vcs = (s: ChangeState): Vcs | undefined => s === ChangeState.ADDED ? 'A' : s === ChangeState.MODIFIED ? 'M' : undefined;
const kinds: Record<number, GitRef['kind']> = { [RefKind.LOCAL]: 'local', [RefKind.REMOTE]: 'remote', [RefKind.TAG]: 'tag' };

export class GitStore {
  revision = 0;
  branch = '';
  upstream = '';
  /* commits not pushed, and not pulled */
  ahead = 0;
  behind = 0;
  /* when the remotes were last asked, in a few words */
  fetched = '';
  refs: readonly GitRef[] = [];
  /* the log, newest first */
  commits: readonly Commit[] = [];
  /* the people who commit to the project */
  people: readonly string[] = [];
  changes: readonly Change[] = [];
  /* a commit message to start from */
  suggestedMessage = '';
  private ignored = new Map<string, boolean>();

  constructor(private readonly link: Link, private readonly projectId: string, private readonly solution: SolutionStore) {
    link.listen('Git', projectId, event => this.apply(event), () => this.load());
  }
  async load(): Promise<void> { this.take(await this.link.call(Git.method.read, { projectId: this.projectId })); }

  /* whether a person said that git ignores a file beside the items, or not; undefined where nobody said */
  ignores(owner: Item, path: string): boolean | undefined { return this.ignored.get(owner.id + '/' + path); }

  commit(message: string, files: readonly { node: Item; f: string }[], push: boolean): Promise<Done> { return this.link.call(Git.method.commit, { projectId: this.projectId, message, files: files.map(f => ({ itemId: f.node.id, path: f.f })), push }); }
  push(): Promise<Done> { return this.link.call(Git.method.push, { projectId: this.projectId }); }
  pull(): Promise<Done> { return this.link.call(Git.method.pull, { projectId: this.projectId }); }
  fetch(): Promise<Done> { return this.link.call(Git.method.fetch, { projectId: this.projectId }); }
  rollback(x: Item): Promise<Done> { return this.link.call(Git.method.rollback, { projectId: this.projectId, itemId: x.id }); }
  setIgnored(owner: Item, path: string, ignored: boolean): Promise<Done> { return this.link.call(Git.method.setIgnored, { projectId: this.projectId, ownerId: owner.id, path, ignored }); }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    this.take(fromBinary(GitSnapshotSchema, event.changes));
  }
  private take(g: GitSnapshot): void {
    const item = (id: string): Item | undefined => this.solution.byId(id);
    this.revision = g.revision;
    this.branch = g.branch; this.upstream = g.upstream; this.ahead = g.ahead; this.behind = g.behind; this.fetched = g.fetched;
    this.people = g.people; this.suggestedMessage = g.suggestedMessage;
    this.refs = g.refs.map(r => ({ name: r.name, label: r.label, kind: kinds[r.kind] ?? 'local', hash: r.hash }));
    this.commits = g.commits.map(c => ({ h: c.hash, l: c.lane, p: c.parents, m: c.message, a: c.author, w: c.when, d: c.days, touched: c.touched.flatMap(t => { const node = item(t.itemId); return node ? [{ node, s: vcs(t.state) ?? 'M' }] : []; }) }));
    this.changes = g.changes.flatMap(group => { const node = item(group.itemId); return node && group.files.length ? [{ node, files: group.files.map(f => ({ f: f.path, s: vcs(f.state) ?? 'M' })) }] : []; });
    this.ignored = new Map(g.ignored.map(f => [f.ownerId + '/' + f.path, f.ignored]));
    for (const x of this.solution.all() as IterableIterator<Writable<Item>>) { x.vcs = undefined; x.lastChange = undefined; }
    for (const o of g.items) {
      const x = item(o.itemId) as Writable<Item> | undefined;
      if (!x) continue;
      x.vcs = vcs(o.state);
      x.lastChange = `${o.lastAuthor}, ${o.lastDays} days ago`;
    }
  }
}
