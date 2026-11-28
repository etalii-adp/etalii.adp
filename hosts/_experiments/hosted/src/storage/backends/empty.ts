/* A seed with nothing in it but one project that holds only its root. A page that draws with it shows that it has no name or number of the example data in its own code. */
import { RefKind } from '../gen/adp/storage/v1/git_pb';
import { gitHashOf, shortGuidOf } from '../ids';
import type { Seed } from './server/seed';

const PROJECT = shortGuidOf('project/empty'), ROOT = shortGuidOf('empty'), FIRST = gitHashOf('empty/first');

export const empty: Seed = {
  version: 'empty-1',
  workspace: '',
  user: { id: shortGuidOf('user/empty'), name: 'You', email: '', initials: 'Y' },
  password: '',
  answerMs: 0,
  providers: [],
  projects: [{ id: PROJECT, name: 'New project', initials: 'NP', colour: 'blue', path: '~/git/new-project', branch: 'main', about: 'Project · no items yet', opened: 'Never' }],
  lastOpenedId: PROJECT,
  project: () => ({
    solution: { revision: 1, rootId: ROOT, path: 'new-project', items: [{ id: ROOT, name: 'New project', kind: 'solution', container: true, accepts: ['area', 'group', 'doc'] }] },
    levels: { revision: 1 },
    git: { revision: 1, branch: 'main', upstream: 'origin/main', fetched: 'Never fetched', people: ['You'], refs: [{ name: 'main', label: 'main', kind: RefKind.LOCAL, hash: FIRST }], commits: [{ hash: FIRST, message: 'Start the project', author: 'You', when: 'Just now' }] },
    status: { revision: 1 },
    workbench: { selectedId: ROOT, documentId: ROOT, tabIds: [ROOT], expandedIds: [ROOT] },
    contentRevision: 1,
  }),
  /* nothing was written yet: every document starts as the empty form of its tool, which the tools know to show */
  document: () => '',
  file: (_state, owner, path) => ({ text: `# ${path}\nitem: ${owner.id}\nname: "${owner.name}"\nkind: ${owner.kind}`, holds: '' }),
  suggestedLink: { repository: '', name: '', refs: [] },
  repository: () => ({ icon: '', refs: ['main'], items: [] }),
  sinceFetch: 'the last time',
  environment: 'the default environment',
};
