/* The projects of the workspace, and opening one. */
import { fromBinary } from '@bufbuild/protobuf';
import { Projects, ProjectsSnapshotSchema, type Project, type ProjectsSnapshot } from '../gen/adp/storage/v1/projects_pb';
import type { Link } from '../link';
import type { ProjectAnswers, ProjectInfo } from '../views';

const info = (p: Project): ProjectInfo => ({ id: p.id, name: p.name, initials: p.initials, colour: p.colour, path: p.path, branch: p.branch, about: p.about, opened: p.opened, asset: p.asset, errors: p.errors });

export class ProjectsStore {
  revision = 0;
  list: readonly ProjectInfo[] = [];
  lastOpenedId = '';
  private readonly listeners = new Set<() => void>();

  constructor(private readonly link: Link) {
    /* a project that was made in another window, or by somebody else, is listed here as well */
    link.listen('Projects', '', event => { if (event.revision > this.revision) { this.take(fromBinary(ProjectsSnapshotSchema, event.changes)); this.tell(); } }, () => this.load().then(() => this.tell()), true);
  }
  /* tells when the list changed from elsewhere; what a page does itself it knows already */
  onChange(listener: () => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  private tell(): void { for (const l of [...this.listeners]) l(); }

  async load(): Promise<void> {
    this.take(await this.link.call(Projects.method.read, {}));
  }
  /* Makes a project of the answers of the New Project wizard, or is refused with the reason. The project is the first of the list, and the one a page opens next. */
  async create(answers: ProjectAnswers): Promise<ProjectInfo> {
    const made = (await this.link.call(Projects.method.create, { name: answers.name, path: answers.path ?? '', branch: answers.branch ?? '', sizeId: answers.sizeId, optionIds: [...answers.optionIds], recipeIds: [...answers.recipeIds] })).project;
    if (!made) throw new Error('The storage made no project.');
    if (!this.list.some(p => p.id === made.id)) this.list = [info(made), ...this.list];
    this.lastOpenedId = made.id;
    return info(made);
  }
  private take(p: ProjectsSnapshot): void {
    this.revision = p.revision;
    this.list = p.projects.map(info);
    this.lastOpenedId = p.lastOpenedId;
  }
  /* opens a project, or is refused with the reason it cannot be opened here */
  async open(id: string): Promise<ProjectInfo> {
    const opened = (await this.link.call(Projects.method.open, { projectId: id })).project;
    if (!opened) throw new Error('The storage opened no project.');
    this.lastOpenedId = id;
    return info(opened);
  }
}
