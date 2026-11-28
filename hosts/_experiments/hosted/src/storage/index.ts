/* The storage of the pages. Everything a page shows that is data comes from here, and everything it changes goes through here: a page asks a store, and the store asks the backend the visit uses. A page never reaches a backend, the messages of the contract, or the browser's own storage.

  connect()            picks the backend and gives the stores every page can use: catalogue, identity, projects
  storage.open(id)     opens a project and gives its stores: solution, levels, content, git, status, workbench, history
  visit, personal      what this browser keeps by itself, in local.ts */
import { methodName, type Backend, type BackendState } from './backend';
import { backendFor, BACKENDS, DEFAULT_BACKEND } from './backends';
import { Git } from './gen/adp/storage/v1/git_pb';
import { History } from './gen/adp/storage/v1/history_pb';
import { Link } from './link';
import { visit } from './local';
import { CatalogueStore } from './stores/catalogue';
import { ContentStore } from './stores/content';
import { GitStore } from './stores/git';
import { HistoryStore } from './stores/history';
import { IdentityStore } from './stores/identity';
import { LevelsStore } from './stores/levels';
import { ProjectsStore } from './stores/projects';
import { SolutionStore } from './stores/solution';
import { StatusStore } from './stores/status';
import { WorkbenchStore } from './stores/workbench';
import type { Done, ProjectInfo } from './views';

export { Refused, Unreachable } from './backend';
export type { BackendState } from './backend';
export { personal, visit } from './local';
export type * from './documents';
export type * from './views';
export type { Icons } from './stores/catalogue';
export type { Added, Removed } from './stores/solution';

/* the stores of one open project */
export class ProjectStorage {
  readonly solution: SolutionStore;
  readonly levels: LevelsStore;
  readonly content: ContentStore;
  readonly git: GitStore;
  readonly status: StatusStore;
  readonly workbench: WorkbenchStore;
  readonly history: HistoryStore;
  private again: Promise<void> | null = null;

  constructor(private readonly link: Link, readonly info: ProjectInfo, catalogue: CatalogueStore) {
    const id = info.id;
    this.solution = new SolutionStore(link, id, () => this.resync());
    this.levels = new LevelsStore(link, id, this.solution);
    this.git = new GitStore(link, id, this.solution);
    this.status = new StatusStore(link, id, this.solution);
    this.content = new ContentStore(link, id, this.solution, catalogue);
    this.workbench = new WorkbenchStore(link, id);
    this.history = new HistoryStore(link, id);
  }

  /* reads everything of the project: the hierarchy first, because the others say things about its items */
  async load(): Promise<void> {
    await this.solution.load();
    await Promise.all([this.levels.load(), this.git.load(), this.status.load(), this.content.load(), this.workbench.load(), this.history.load()]);
  }

  /* what a refusal offers to do instead, by the name of its call; null where the page has nothing for it */
  action(method: string): (() => Promise<Done>) | null {
    if (method === methodName(Git.method.pull)) return () => this.git.pull();
    if (method === methodName(Git.method.push)) return () => this.git.push();
    if (method === methodName(Git.method.fetch)) return () => this.git.fetch();
    if (method === methodName(History.method.undo)) return () => this.history.undo();
    return null;
  }

  /* a change was missed: everything but the window's own state is read again, and the page is told */
  private resync(): void {
    this.again ??= Promise.resolve().then(async () => {
      try {
        await this.solution.load();
        await Promise.all([this.levels.load(), this.git.load(), this.status.load(), this.content.load(), this.history.load()]);
      } catch { /* the storage is away: it is read again when it is back */ } finally { this.again = null; this.link.tell(); }
    });
  }
}

export class Storage {
  readonly catalogue: CatalogueStore;
  readonly identity: IdentityStore;
  readonly projects: ProjectsStore;
  private readonly link: Link;

  constructor(backend: Backend) {
    this.link = new Link(backend);
    this.catalogue = new CatalogueStore(this.link);
    this.identity = new IdentityStore(this.link);
    this.projects = new ProjectsStore(this.link);
  }

  /* opens a project and reads all of it; refused with the reason when it cannot be opened */
  async open(projectId: string): Promise<ProjectStorage> {
    const project = new ProjectStorage(this.link, await this.projects.open(projectId), this.catalogue);
    await project.load();
    return project;
  }

  /* where the data is kept, by the name of the backend */
  get keptIn(): string { return this.link.backend.name; }
  get state(): BackendState { return this.link.state; }
  onState(listener: (state: BackendState) => void): () => void { return this.link.onState(listener); }
  /* told when an answer takes long enough to say so, and when it is there */
  onWaiting(listener: (waiting: boolean) => void): () => void { return this.link.onWaiting(listener); }
  /* told once after changes this page did not cause itself: another window, another user, or a connection that was away */
  onForeign(listener: () => void): () => void { return this.link.onForeign(listener); }
}

/* Picks the backend this visit uses and connects to it. A page's address can ask for one with ?backend=…, and for a hosted service with ?service=wss://…; the choice is kept for the visit, so it holds from page to page. */
export async function connect(): Promise<Storage> {
  const asked = typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);
  const backend = asked.get('backend'), service = asked.get('service');
  if (backend !== null) visit.set('backend', (BACKENDS as readonly string[]).includes(backend.split(':')[0]) ? backend : '');
  if (service !== null) visit.set('service', service);
  return new Storage(await backendFor(visit.get('backend') || DEFAULT_BACKEND, visit.get('service')));
}
