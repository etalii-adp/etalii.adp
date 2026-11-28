/* What a backend in this page starts from: the workspace and its user, the projects, the state each project opens with, and the text of everything that was never written. The example data is one seed and the empty workspace another. */
import type { MessageInitShape } from '@bufbuild/protobuf';
import type { FileTextSchema } from '../../../gen/adp/storage/v1/content_pb';
import type { UserSchema } from '../../../gen/adp/storage/v1/identity_pb';
import type { KeptProjectSchema } from '../../../gen/adp/storage/v1/kept_pb';
import type { Project, ProjectSchema } from '../../../gen/adp/storage/v1/projects_pb';
import type { Item } from '../../../gen/adp/storage/v1/solution_pb';
import type { ProjectState, World } from './core';

/* what a repository that is linked in brings: an icon, the branches and tags it has, and its items */
export interface Repository { icon: string; refs: string[]; items: { name: string; kind: string }[] }

export interface Seed {
  /* changes when the data does, so state that was kept from an older seed is left behind */
  version: string;
  workspace: string;
  user: MessageInitShape<typeof UserSchema>;
  /* the password every user of the workspace has, where empty lets any password in; and how long an identity provider takes to answer */
  password: string;
  answerMs: number;
  providers: string[];
  projects: MessageInitShape<typeof ProjectSchema>[];
  lastOpenedId: string;
  /* the state a project opens with, or the reason it does not open */
  project(about: Project, world: World): MessageInitShape<typeof KeptProjectSchema> | string;
  /* the text of an item's stored form that was never written, and of a file beside the items */
  document(state: ProjectState, item: Item, world: World): string;
  file(state: ProjectState, owner: Item, path: string, world: World): MessageInitShape<typeof FileTextSchema>;
  /* a repository to offer when one is linked in, and what a repository holds */
  suggestedLink: { repository: string; name: string; refs: string[] };
  repository(url: string): Repository;
  /* since when a fetch finds nothing new, and the environment things are started on */
  sinceFetch: string;
  environment: string;
}
