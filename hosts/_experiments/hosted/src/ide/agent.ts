/* The Agent tool window: a conversation with the agent about the project, and the conversations that are over. The question is asked of the selected item unless that is switched off; the agent's answer arrives a moment later, and names the items it is about. */
import { h } from 'preact';
import { $, draw } from '../common/dom';
import { dialog, menu } from '../common/popups';
import { Agent, AgentButtons, RenameConversation, type About, type AgentActions, type Listing, type Talk } from './agent.tsx';
import { body, pel } from './docks';
import { alive, ownerOf, ROOT } from './model';
import { openDoc } from './open';
import { itemAt, keep, S } from './state';
import { act, project, refused } from './storage';
import type { Item } from './types';

/* what a new conversation offers to start with */
const STARTERS = ['What is wrong in this project?', 'What changed since the last commit?', 'Tell me about the selected item.', 'Who changed what lately?'];

/* What the tool window shows, part by part. Each part is as it was last worked out: the conversation while the list shows, the list while a conversation shows, and what a question is asked of while the tool window is out of sight. */
let title = '', talk: Talk = { hello: null, said: [], alive, pending: null, waiting: false, hint: 'Ask about this project', unsendable: false }, listing: Listing | null = null, about: About | null = null;
/* true once the tool window was drawn */
let drawn = false;
/* whether the question is asked of the selected item, and what the log showed last: a conversation and how much of it */
let aboutSelected = true, shown = '';
/* a question that is on its way to the storage: that it is, its text, and how much the conversation held when it left */
let sending = false, pending = '', heldAtSend = 0;

/* the item a question is asked of: the selected one, or the item a file of the File System view belongs to */
const selected = (): Item => ownerOf(S.sel);
const field = (): HTMLTextAreaElement => $<HTMLTextAreaElement>('.ag-ask textarea', pel.agent);
const search = (): HTMLInputElement => $<HTMLInputElement>('#ag-q', pel.agent);
const showConversation = (id: string): void => { S.chat = id; S.chats = false; renderAgent(); keep(); };

const on: AgentActions = {
  search: () => renderAgent(),
  say: text => say(text),
  /* a question can be sent once there is one */
  typed: text => { talk = { ...talk, unsendable: sending || !text.trim() }; paint(); },
  about: () => { aboutSelected = !aboutSelected; renderAbout(); },
  open: itemId => { const item = itemAt(itemId); if (item && alive(item)) openDoc(item); },
  show: showConversation,
  more: (conversation, button) => { const r = button.getBoundingClientRect(); conversationMenu(conversation, r.left - 110, r.bottom + 3); },
  menu: conversationMenu,
};

/* draws the tool window from its parts as they are */
function paint(): void {
  draw($('[data-pa]', pel.agent), h(AgentButtons, {
    lists: S.chats,
    fresh: () => { S.chat = ''; S.chats = false; renderAgent(); keep(); field().focus(); },
    all: () => { S.chats = !S.chats; renderAgent(); if (S.chats) search().focus(); },
  }));
  draw(body('agent'), h(Agent, { title, lists: S.chats, talk, listing, about, on }));
  drawn = true;
}

export function mountAgent(): void {
  paint();
  /* an answer, and what was said in a conversation that was asked for, are shown when they are there */
  project.agent.onChange(renderAgent);
}

function conversationMenu(id: string, x: number, y: number): void {
  const c = project.agent.conversation(id);
  if (!c) return;
  menu([
    { l: 'Open', on: () => showConversation(id) },
    { l: 'Rename…', on: () => dialog('Rename Conversation', h(RenameConversation, { title: c.title }), 'Rename', dlg => { void act(project.agent.rename(id, $<HTMLInputElement>('input', dlg).value)); }) },
    '-',
    { l: 'Delete', on: () => { void act(project.agent.remove(id)); } },
  ], x, y);
}

/* asks the agent, in the conversation that is open or in a new one */
function say(text: string): void {
  const question = text.trim();
  if (!question || sending) return;
  const about = aboutSelected && selected() !== ROOT ? selected() : undefined, typed = field().value;
  sending = true; pending = question; heldAtSend = S.chat ? project.agent.messages(S.chat)?.length ?? 0 : 0;
  field().value = '';
  S.chats = false;
  renderAgent();
  project.agent.ask(question, S.chat, about).then(id => { S.chat = id; keep(); }, (e: unknown) => { refused(e); if (!field().value) field().value = typed; }).finally(() => { sending = false; renderAgent(); });
}

function renderAbout(): void {
  const x = selected();
  about = { item: x, whole: x === ROOT, selected: aboutSelected };
  paint();
}
/* the item a question is asked of follows the selection */
export function agentFollowsSelection(): void { if (drawn && !pel.agent.hidden) renderAbout(); }

export function renderAgent(): void {
  const agent = project.agent;
  if (S.chat && !agent.conversation(S.chat) && !sending) { S.chat = ''; keep(); }
  const open = agent.conversation(S.chat);
  title = S.chats ? 'Conversations' : open?.title ?? 'New conversation';

  if (S.chats) {
    const q = drawn ? search().value.trim().toLowerCase() : '', found = agent.conversations.filter(c => !q || c.title.toLowerCase().includes(q) || c.last.toLowerCase().includes(q));
    listing = { found, open: S.chat, none: agent.conversations.length ? 'No conversation matches that search.' : 'There are no conversations yet.' };
    paint();
    return;
  }

  const said = open ? agent.messages(open.id) : [], now = `${S.chat}/${said?.length ?? -1}/${open?.answering ?? sending}`;
  talk = {
    hello: !open && !sending ? { project: ROOT.name, starters: STARTERS } : null,
    said: said ?? [], alive,
    pending: sending && (said?.length ?? 0) <= heldAtSend ? pending : null,
    waiting: !!open?.answering || sending,
    hint: open ? 'Ask a follow-up' : 'Ask about this project',
    unsendable: sending || !(drawn && field().value.trim()) || !!open?.answering,
  };
  const x = selected();
  about = { item: x, whole: x === ROOT, selected: aboutSelected };
  paint();
  /* what is new is at the end, so the log shows its end when it changed */
  if (now !== shown) { shown = now; const log = $('.ag-log', pel.agent); log.scrollTop = log.scrollHeight; }
}
