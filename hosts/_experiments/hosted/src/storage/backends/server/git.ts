/* The calls of the Git store: the log and the branches, committing, pushing, updating, fetching, rolling back, and what git ignores. */
import { create } from '@bufbuild/protobuf';
import { Refused, methodName } from '../../backend';
import { ChangeState, Git, GitCommitSchema, IgnoredFileSchema, type GitSnapshot } from '../../gen/adp/storage/v1/git_pb';
import { newGitHash } from '../../ids';
import type { World } from './core';
import { gitOf, itemOf, sealHistory, subtree, tellGit, unmark } from './project';

const refOf = (git: GitSnapshot, name: string) => git.refs.find(r => r.name === name);
/* a new commit on top of the log, with the branch moved to it */
function commitOnTop(git: GitSnapshot, message: string, parents: string[], touched: { itemId: string; state: ChangeState }[] = []): void {
  const c = create(GitCommitSchema, { hash: newGitHash(), lane: 0, parents, message, author: git.people[0] ?? '', when: 'Just now', days: 0, touched });
  git.commits.unshift(c);
  const head = refOf(git, git.branch);
  if (head) head.hash = c.hash;
}

export function serveGit(world: World): void {
  const { server } = world;

  server.on(Git.method.read, r => {
    const state = world.project(r.projectId);
    /* every item has a last change, made the first time it is asked for */
    for (const x of state.items.values()) gitOf(state, x);
    return state.kept.git!;
  });

  server.on(Git.method.commit, (r, call) => {
    const state = world.project(r.projectId), git = state.kept.git!, message = r.message.trim();
    if (!message) throw new Refused('invalid', 'Write a commit message first.');
    const chosen = (itemId: string, path: string): boolean => r.files.some(f => f.itemId === itemId && f.path === path);
    const touched: { itemId: string; state: ChangeState }[] = [];
    let count = 0;
    for (const group of git.changes) {
      const taken = group.files.filter(f => chosen(group.itemId, f.path));
      if (!taken.length) continue;
      count += taken.length;
      touched.push({ itemId: group.itemId, state: taken[0].state });
      group.files = group.files.filter(f => !taken.includes(f));
      /* an item with nothing left to commit is unchanged again */
      if (!group.files.length) { const g = git.items.find(o => o.itemId === group.itemId); if (g) g.state = ChangeState.UNSPECIFIED; }
    }
    if (!count) throw new Refused('invalid', 'Select at least one file to commit.');
    git.changes = git.changes.filter(g => g.files.length);
    commitOnTop(git, message, [refOf(git, git.branch)?.hash ?? ''].filter(Boolean), touched);
    git.ahead++;
    if (r.push) { const up = refOf(git, git.upstream); if (up) up.hash = refOf(git, git.branch)!.hash; git.ahead = 0; }
    sealHistory(world, state, call);
    tellGit(world, state, call);
    return { message: `Committed ${count} files to ${git.branch}${r.push ? ' and pushed to origin' : ''}` };
  });

  /* takes the commits of the upstream branch in, with a merge commit on top of the log */
  server.on(Git.method.pull, (r, call) => {
    const state = world.project(r.projectId), git = state.kept.git!;
    if (!git.behind) return { message: `${git.branch} is up to date with ${git.upstream}` };
    const incoming = git.behind;
    commitOnTop(git, `Merge remote-tracking branch '${git.upstream}' into ${git.branch}`, [refOf(git, git.branch)?.hash ?? '', refOf(git, git.upstream)?.hash ?? ''].filter(Boolean));
    git.behind = 0;
    git.ahead++;
    sealHistory(world, state, call);
    tellGit(world, state, call);
    return { message: `Merged ${incoming} incoming commits into ${git.branch}` };
  });

  server.on(Git.method.push, (r, call) => {
    const state = world.project(r.projectId), git = state.kept.git!;
    if (!git.ahead) return { message: 'Nothing to push' };
    if (git.behind) throw new Refused('behind', `Update the project first: ${git.upstream} has ${git.behind} commits you do not have.`, 'Update', methodName(Git.method.pull));
    const outgoing = git.ahead, up = refOf(git, git.upstream);
    if (up) up.hash = refOf(git, git.branch)?.hash ?? up.hash;
    git.ahead = 0;
    tellGit(world, state, call);
    return { message: `Pushed ${outgoing} commits to ${git.upstream}` };
  });

  server.on(Git.method.fetch, r => {
    world.project(r.projectId);
    return { message: `Fetched origin. Nothing new since ${world.seed.sinceFetch}.` };
  });

  server.on(Git.method.rollback, (r, call) => {
    const state = world.project(r.projectId), x = itemOf(state, r.itemId);
    unmark(state, subtree(state, x));
    tellGit(world, state, call);
    return { message: 'Rolled back local changes in ' + x.name };
  });

  server.on(Git.method.setIgnored, (r, call) => {
    const state = world.project(r.projectId), git = state.kept.git!;
    itemOf(state, r.ownerId);
    git.ignored = git.ignored.filter(f => !(f.ownerId === r.ownerId && f.path === r.path));
    git.ignored.push(create(IgnoredFileSchema, { ownerId: r.ownerId, path: r.path, ignored: r.ignored }));
    tellGit(world, state, call);
    return {};
  });
}
