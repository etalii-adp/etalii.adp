/* Puts a world together: a seed, the catalogue, and every call of the contract. */
import { Refused } from '../../backend';
import { Catalogue } from '../../gen/adp/storage/v1/catalogue_pb';
import { Identity } from '../../gen/adp/storage/v1/identity_pb';
import { Projects } from '../../gen/adp/storage/v1/projects_pb';
import { Severity } from '../../gen/adp/storage/v1/status_pb';
import { Workbench } from '../../gen/adp/storage/v1/workbench_pb';
import { catalogue, icons } from '../catalogue';
import { serveAgent, settleAgent } from './agent';
import { serveContent } from './content';
import { World } from './core';
import { serveCreate } from './create';
import { serveGit } from './git';
import { serveHistory } from './history';
import { serveLevels } from './levels';
import type { Seed } from './seed';
import { serveSolution } from './solution';
import { serveStatus } from './status';

const wait = (ms: number): Promise<void> => new Promise(done => setTimeout(done, ms));

export function makeWorld(seed: Seed, kept: Iterable<[string, Uint8Array]> = []): World {
  const world = new World(seed, catalogue(), icons(), kept), { server } = world;

  server.on(Catalogue.method.read, () => world.catalogue);
  server.on(Catalogue.method.readIcons, () => world.icons);

  server.on(Identity.method.read, () => ({ workspace: seed.workspace, user: seed.user, signedIn: world.signedIn, providers: seed.providers }));
  server.on(Identity.method.signIn, r => {
    if (seed.password && r.password !== seed.password) throw new Refused('denied', 'The email or the password is not right.');
    world.signedIn = true;
    return { user: seed.user };
  });
  /* the workspace is asked for its identity provider, and has none */
  server.on(Identity.method.singleSignOn, async r => {
    await wait(seed.answerMs);
    throw new Refused('not-set-up', `Single sign-on is not set up for ${r.workspace}. A workspace administrator can connect an identity provider. Until then, sign in with your email and password.`);
  });
  /* a git provider confirms who you are, and the workspace knows no user with that account */
  server.on(Identity.method.providerSignIn, async r => {
    await wait(seed.answerMs);
    throw new Refused('not-linked', `No user of ${r.workspace || 'this workspace'} is linked to this ${r.provider} account. Sign in with your email and password, then link the account in your account settings.`);
  });
  server.on(Identity.method.signOut, () => { world.signedIn = false; return {}; });

  server.on(Projects.method.read, () => world.projects);
  server.on(Projects.method.open, r => {
    const state = world.project(r.projectId), project = world.projects.projects.find(p => p.id === r.projectId)!;
    project.errors = state.kept.status!.problems.filter(p => p.severity === Severity.ERROR).length;
    world.projects.lastOpenedId = project.id;
    return { project };
  });

  server.on(Workbench.method.read, r => world.project(r.projectId).kept.workbench ?? {});
  /* a window's own state: it is kept, and nobody else is told */
  server.on(Workbench.method.write, r => {
    const state = world.project(r.projectId);
    state.kept.workbench = r.workbench;
    server.quiet.add(state.id);
    return {};
  });

  serveSolution(world);
  serveContent(world);
  serveLevels(world);
  serveGit(world);
  serveStatus(world);
  serveHistory(world);
  serveAgent(world);
  serveCreate(world);
  /* what was kept while the agent was still answering */
  for (const id of world.opened()) settleAgent(world, world.project(id));
  return world;
}
