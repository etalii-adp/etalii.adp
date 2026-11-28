/* The projects of the workspace, and opening one. */
import { Projects, type Project } from '../gen/adp/storage/v1/projects_pb';
import type { Link } from '../link';
import type { ProjectInfo } from '../views';

const info = (p: Project): ProjectInfo => ({ id: p.id, name: p.name, initials: p.initials, colour: p.colour, path: p.path, branch: p.branch, about: p.about, opened: p.opened, asset: p.asset, errors: p.errors });

export class ProjectsStore {
  list: readonly ProjectInfo[] = [];
  lastOpenedId = '';

  constructor(private readonly link: Link) {}

  async load(): Promise<void> {
    const p = await this.link.call(Projects.method.read, {});
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
