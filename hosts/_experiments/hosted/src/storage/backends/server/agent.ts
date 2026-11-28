/* The calls of the Agent store: the conversations a user has with the agent about a project. The agent here reads the project as it is, the hierarchy, what validation found and what git says, and answers from that; it changes nothing. Its answer comes a moment after the question, as a change. */
import { create, fromBinary } from '@bufbuild/protobuf';
import { Refused } from '../../backend';
import { Agent, AgentChangesSchema, AgentMessageSchema, Author, ConversationSchema, ConversationSummarySchema, KeptAgentSchema, type Conversation, type KeptAgent } from '../../gen/adp/storage/v1/agent_pb';
import { ChangeState } from '../../gen/adp/storage/v1/git_pb';
import { KeptProjectSchema } from '../../gen/adp/storage/v1/kept_pb';
import type { Item } from '../../gen/adp/storage/v1/solution_pb';
import { RunState, Severity } from '../../gen/adp/storage/v1/status_pb';
import { newShortGuid } from '../../ids';
import type { Call, ProjectState, World } from './core';
import { childrenOf, gitOf, inSentence, kindOf, parentOf, subtree } from './project';

/* how much of a question is its conversation's title, and how much of a message a list shows */
const TITLE = 56, LAST = 90;
/* how many things an answer names before it says how many more there are */
const NAMED = 6;

/* the agent itself, as the one who caused a change */
const AGENT: Call = { id: '', user: 'Agent' };

const agentOf = (state: ProjectState): KeptAgent => state.kept.agent ??= create(KeptAgentSchema, { revision: 1 });
const conversation = (state: ProjectState, id: string): Conversation => {
  const found = agentOf(state).conversations.find(c => c.about!.id === id);
  if (!found) throw new Refused('gone', 'That conversation is no longer there.');
  return found;
};
/* a text cut at a word, with a mark that there was more */
const cut = (text: string, length: number): string => { const line = text.replace(/\s+/g, ' ').trim(); return line.length <= length ? line : line.slice(0, line.lastIndexOf(' ', length) > length / 2 ? line.lastIndexOf(' ', length) : length).replace(/[\s.,:;]+$/, '') + '…'; };
const clock = (): string => { const now = new Date(); return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; };

function say(c: Conversation, author: Author, text: string, itemIds: string[], steps: string[] = []): void {
  const about = c.about!, time = clock();
  c.messages.push(create(AgentMessageSchema, { id: newShortGuid(), author, text, time, itemIds, steps }));
  about.day = 'Today'; about.time = time; about.messages = c.messages.length; about.last = cut(text, LAST);
}

export function tellAgent(world: World, state: ProjectState, call: Call, spoken?: Conversation, deletedId = ''): void {
  const agent = agentOf(state);
  agent.revision++;
  world.server.changed.add(state.id);
  world.server.emit('Agent', state.id, agent.revision, call, AgentChangesSchema, { conversations: agent.conversations.map(c => c.about!), spoken, deletedId });
}

/* What another window of the same user kept of the conversations takes the place of what is here, and this window's stores are told. */
export function adoptAgent(world: World, state: ProjectState, bytes: Uint8Array, call: Call): void {
  const theirs = fromBinary(KeptProjectSchema, bytes).agent;
  if (!theirs) return;
  theirs.revision = Math.max(theirs.revision, agentOf(state).revision);
  state.kept.agent = theirs;
  tellAgent(world, state, call);
}

/* A question that was kept without its answer, because the page was left before the agent was done, is answered now. */
export function settleAgent(world: World, state: ProjectState): void {
  for (const c of agentOf(state).conversations) {
    if (!c.about!.answering) continue;
    const asked = [...c.messages].reverse().find(m => m.author === Author.USER);
    answer(world, state.id, c.about!.id, asked?.text ?? '', asked?.itemIds[0] ?? '');
  }
}

const plural = (n: number, one: string, many = one + 's'): string => `${n} ${n === 1 ? one : many}`;
const has = (text: string, ...words: string[]): boolean => words.some(w => text.includes(w));
/* a list in a sentence: "a, b and c", and how many more there are past the first few */
function listed(names: string[]): string {
  const shown = names.slice(0, NAMED), more = names.length - shown.length;
  if (more) return `${shown.join(', ')} and ${more} more`;
  return shown.length > 1 ? `${shown.slice(0, -1).join(', ')} and ${shown.at(-1)}` : shown[0] ?? '';
}
const SEVERITY_WORD: Record<number, string> = { [Severity.ERROR]: 'Error', [Severity.WARNING]: 'Warning', [Severity.INFO]: 'Note' };
/* the words of a question that say nothing about what is looked for */
const SMALL = new Set(['the', 'and', 'for', 'are', 'was', 'where', 'find', 'search', 'which', 'what', 'that', 'this', 'with', 'does', 'have', 'has', 'all', 'any', 'item', 'items', 'called', 'named', 'show', 'list', 'can', 'you', 'there', 'project', 'solution', 'about', 'from', 'use', 'uses', 'used']);

interface Answer { text: string; itemIds: string[]; steps: string[] }

/* what the agent says to a question, from the project as it is */
function compose(world: World, state: ProjectState, asked: string, aboutId: string): Answer {
  const q = asked.toLowerCase(), root = state.items.get(state.kept.solution!.rootId)!, about = state.items.get(aboutId), git = state.kept.git!, status = state.kept.status!;
  const items = [...state.items.values()].filter(x => x.parentId && !kindOf(world, x).storedInside);
  const problems = status.problems.filter(p => state.items.has(p.itemId)).sort((a, b) => a.severity - b.severity);
  const count = (s: Severity): number => problems.filter(p => p.severity === s).length;
  const name = (id: string): string => state.items.get(id)?.name ?? '';
  const label = (x: Item): string => inSentence(kindOf(world, x));
  const steps = [`Read the hierarchy of ${root.name}: ${plural(items.length, 'item')}`];
  const found = `${plural(count(Severity.ERROR), 'error')}, ${plural(count(Severity.WARNING), 'warning')} and ${plural(count(Severity.INFO), 'note')}`;

  if (has(q, 'problem', 'error', 'warning', 'wrong', 'broken', 'validat', 'fix', 'issue')) {
    steps.push('Read what validation found');
    const under = about && about !== root ? new Set(subtree(state, about).map(x => x.id)) : null, here = under ? problems.filter(p => under.has(p.itemId)) : [];
    const shown = here.length ? here : problems, where = here.length ? `under ${about!.name}` : `in ${root.name}`;
    if (!shown.length) return { text: `Validation finds no problems in ${root.name}.`, itemIds: [], steps };
    const lines = shown.slice(0, NAMED).map(p => `• ${SEVERITY_WORD[p.severity] ?? 'Note'}, ${name(p.itemId)}: ${p.message}`);
    const more = shown.length > NAMED ? `\nAnd ${shown.length - NAMED} more in the Problems tool window.` : '';
    const first = shown[0], lead = here.length ? `Validation finds ${plural(here.length, 'problem')} ${where}:` : `Validation finds ${found} ${where}:`;
    return { text: `${lead}\n${lines.join('\n')}${more}\n\nI would start with ${name(first.itemId)}: ${first.severity === Severity.ERROR ? 'an error keeps it from being released' : 'it is the most serious one that is left'}.`, itemIds: [...new Set(shown.slice(0, NAMED).map(p => p.itemId))], steps };
  }

  /* who did what is a question for the log, also when it says "changed" */
  const lately = has(q, 'who ', 'lately', 'history', 'the log', 'recent');
  if (!lately && has(q, 'uncommitted', 'not committed', 'change', 'diff', 'pending', 'modified')) {
    steps.push(`Read the changes on ${git.branch}`);
    const changed = git.changes.filter(c => state.items.has(c.itemId));
    if (!changed.length) return { text: `Nothing is waiting to be committed on ${git.branch}.`, itemIds: [], steps };
    const added = changed.filter(c => c.files.some(f => f.state === ChangeState.ADDED)).length, files = changed.reduce((n, c) => n + c.files.length, 0);
    const behind = git.behind ? ` The branch is ${plural(git.behind, 'commit')} behind ${git.upstream}, so pull before you push.` : '';
    return { text: `${plural(changed.length, 'item has', 'items have')} changes that are not committed on ${git.branch}, in ${plural(files, 'file')}: ${listed(changed.map(c => name(c.itemId)))}.${added ? ` ${plural(added, 'of them is', 'of them are')} new.` : ''}${behind}`, itemIds: changed.slice(0, NAMED).map(c => c.itemId), steps };
  }

  if (lately || has(q, 'commit')) {
    steps.push(`Read the log of ${git.branch}`);
    const last = git.commits.slice(0, 5);
    if (!last.length) return { text: `There are no commits on ${git.branch} yet.`, itemIds: [], steps };
    return { text: `The last ${plural(last.length, 'commit')} on ${git.branch}:\n${last.map(c => `• ${c.message} (${c.author}, ${c.when})`).join('\n')}`, itemIds: [...new Set(last.flatMap(c => c.touched.map(t => t.itemId)).filter(id => state.items.has(id)))].slice(0, NAMED), steps };
  }

  if (has(q, 'where', 'find', 'search', 'which')) {
    const words = q.split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 2 && !SMALL.has(w));
    steps.push('Searched the names of the items');
    /* a name that has more of the words comes first, then one that has them as whole words, then the shorter name */
    const score = (x: Item): number => { const name = x.name.toLowerCase(), whole = name.split(/[^\p{L}\p{N}]+/u); return words.filter(w => name.includes(w)).length * 100 + words.filter(w => whole.includes(w)).length * 10 - name.length / 100; };
    const hits = words.length ? items.filter(x => words.some(w => x.name.toLowerCase().includes(w))).sort((a, b) => score(b) - score(a)) : [];
    if (!hits.length) return { text: words.length ? `Nothing in ${root.name} has ${listed(words.map(w => `"${w}"`))} in its name.` : 'Tell me a word of its name and I look for it.', itemIds: [], steps };
    const lines = hits.slice(0, NAMED).map(x => `• ${x.name}, ${label(x)} in ${parentOf(state, x)?.name ?? root.name}`);
    return { text: `${plural(hits.length, 'item has', 'items have')} that in ${hits.length === 1 ? 'its name' : 'their names'}:\n${lines.join('\n')}${hits.length > NAMED ? `\nAnd ${hits.length - NAMED} more.` : ''}`, itemIds: hits.slice(0, NAMED).map(x => x.id), steps };
  }

  if (has(q, 'run', 'deploy', 'release', 'environment', 'staging', 'production')) {
    steps.push('Read the environments and what was started');
    const target = state.items.get(status.defaultRunId), running = status.runs.filter(r => r.state === RunState.RUNNING || r.state === RunState.QUEUED);
    const environments = status.environments.length ? status.environments.map(e => `${e.name} is ${e.healthy ? 'healthy' : 'not healthy'}`).join(', ') + '.' : 'No environment reports its state yet.';
    const errors = count(Severity.ERROR) ? ` Validation still finds ${plural(count(Severity.ERROR), 'error')}, which I would clear before a release.` : '';
    return { text: `${environments}${target ? ` The run button starts ${target.name}.` : ''}${running.length ? ` Started and not done: ${listed(running.map(r => r.label))}.` : ' Nothing is running now.'}${errors}`, itemIds: target ? [target.id] : [], steps };
  }

  if (has(q, 'add', 'create', 'new ', 'make', 'build', 'generate')) {
    const level = about && about.container ? about : about ? parentOf(state, about) ?? root : root, kind = kindOf(world, level);
    const takes = (level.accepts.length ? level.accepts : kind.takes.length ? kind.takes : world.catalogue.defaultAccepts).map(k => world.kinds.get(k)?.label).filter((l): l is string => !!l);
    steps.push(`Read what ${level.name} takes`);
    return { text: `${level.name} takes ${plural(takes.length, 'kind')} of item: ${takes.join(', ')}.\n\nNew, in the Explorer's menu on ${level.name}, adds one. It starts empty and opens in its tool, and it shows among the changes until it is committed.`, itemIds: [level.id], steps };
  }

  if (about && about !== root) {
    const kind = kindOf(world, about), children = childrenOf(state, about), g = gitOf(state, about), on = problems.filter(p => p.itemId === about.id), path: string[] = [];
    for (let p = parentOf(state, about); p; p = parentOf(state, p)) path.unshift(p.name);
    steps.push(`Read ${about.name}`);
    const word = world.catalogue.words[kind.tool], parts = [`${about.name} is ${/^[aeiou]/i.test(label(about)) ? 'an' : 'a'} ${label(about)} in ${path.join(' › ')}.`];
    if (about.link) parts.push(`It comes from ${about.link.repository} at ${about.link.ref}, and what is in it is read-only here.`);
    if (children.length) parts.push(`It holds ${plural(children.length, 'item')}: ${listed(children.map(k => k.name))}.`);
    else if (word) parts.push(`It opens in ${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word.toLowerCase()}.`);
    if (g.lastAuthor) parts.push(g.lastDays ? `${g.lastAuthor} changed it last, ${plural(g.lastDays, 'day')} ago.` : `${g.lastAuthor} changed it last, today.`);
    if (g.state !== ChangeState.UNSPECIFIED) parts.push(g.state === ChangeState.ADDED ? 'It is new and not committed yet.' : 'It has changes that are not committed.');
    parts.push(on.length ? `Validation finds ${plural(on.length, 'problem')} on it: ${on.map(p => p.message).join('; ')}.` : 'Validation finds nothing wrong with it.');
    return { text: parts.join(' '), itemIds: [about.id, ...children.slice(0, NAMED - 1).map(k => k.id)], steps };
  }

  steps.push('Read what validation found', `Read the changes on ${git.branch}`);
  const levels = childrenOf(state, root), changed = git.changes.filter(c => state.items.has(c.itemId)).length;
  return {
    text: `${root.name} holds ${plural(items.length, 'item')}${levels.length ? ` under ${listed(levels.map(l => l.name))}` : ''}. Validation finds ${found}, and ${plural(changed, 'item has', 'items have')} changes that are not committed on ${git.branch}.\n\nAsk me what is wrong, what changed, who changed what lately, or where something is. Select an item and I tell you about that one.`,
    itemIds: [], steps,
  };
}

/* the agent's answer to a question, said in its conversation when it is still there */
function answer(world: World, projectId: string, conversationId: string, asked: string, aboutId: string): void {
  const state = world.project(projectId), c = agentOf(state).conversations.find(o => o.about!.id === conversationId);
  if (!c) return;
  const said = compose(world, state, asked, aboutId);
  say(c, Author.AGENT, said.text, said.itemIds, said.steps);
  c.about!.answering = false;
  tellAgent(world, state, AGENT, c);
}

export function serveAgent(world: World): void {
  const { server } = world;

  server.on(Agent.method.read, r => { const agent = agentOf(world.project(r.projectId)); return { revision: agent.revision, conversations: agent.conversations.map(c => c.about!) }; });
  server.on(Agent.method.readConversation, r => conversation(world.project(r.projectId), r.conversationId));

  server.on(Agent.method.ask, (r, call) => {
    const state = world.project(r.projectId), agent = agentOf(state), text = r.text.trim();
    if (!text) throw new Refused('empty', 'There is nothing to ask yet.');
    const c = r.conversationId ? conversation(state, r.conversationId) : create(ConversationSchema, { about: create(ConversationSummarySchema, { id: newShortGuid(), title: cut(text, TITLE) }) });
    if (c.about!.answering) throw new Refused('busy', 'The agent is still answering. Ask again when it is done.');
    /* the conversation that was spoken in last is the first of the list */
    agent.conversations = [c, ...agent.conversations.filter(o => o !== c)];
    const aboutId = state.items.has(r.aboutItemId) ? r.aboutItemId : '';
    say(c, Author.USER, text, aboutId ? [aboutId] : []);
    c.about!.answering = true;
    tellAgent(world, state, call, c);
    const id = c.about!.id;
    setTimeout(() => server.later(() => answer(world, r.projectId, id, text, aboutId)), world.seed.answerMs);
    return { conversationId: id };
  });

  server.on(Agent.method.rename, (r, call) => {
    const state = world.project(r.projectId), c = conversation(state, r.conversationId), title = r.title.trim();
    if (!title) throw new Refused('empty', 'A conversation needs a title.');
    c.about!.title = cut(title, TITLE);
    tellAgent(world, state, call, c);
    return {};
  });

  server.on(Agent.method.delete, (r, call) => {
    const state = world.project(r.projectId), c = conversation(state, r.conversationId), agent = agentOf(state);
    agent.conversations = agent.conversations.filter(o => o !== c);
    tellAgent(world, state, call, undefined, c.about!.id);
    return { message: `Deleted the conversation "${c.about!.title}"` };
  });
}
