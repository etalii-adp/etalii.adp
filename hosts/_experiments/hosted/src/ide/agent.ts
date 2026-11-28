/* The Agent tool window: a conversation with the agent about the project, and the conversations that are over. The question is asked of the selected item unless that is switched off; the agent's answer arrives a moment later, and names the items it is about. */
import { $, el, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { dialog, menu } from '../common/popups';
import { body, pel } from './docks';
import { K } from './kinds';
import { alive, ownerOf, ROOT } from './model';
import { openDoc } from './open';
import { itemAt, keep, S } from './state';
import { act, project, refused } from './storage';
import type { Item } from './types';

/* what a new conversation offers to start with */
const STARTERS = ['What is wrong in this project?', 'What changed since the last commit?', 'Tell me about the selected item.', 'Who changed what lately?'];

let log: HTMLElement, list: HTMLElement, rows: HTMLElement, ask: HTMLFormElement, field: HTMLTextAreaElement, search: HTMLInputElement, title: HTMLElement;
/* whether the question is asked of the selected item, and what the log showed last: a conversation and how much of it */
let aboutSelected = true, shown = '';
/* a question that is on its way to the storage: that it is, its text, and how much the conversation held when it left */
let sending = false, pending = '', heldAtSend = 0;

/* the item a question is asked of: the selected one, or the item a file of the File System view belongs to */
const selected = (): Item => ownerOf(S.sel);
const chip = (x: Item): string => `<button type="button" class="ag-item" data-i="${x.id}" title="Open ${esc(x.name)}">${ico(x.icon || K[x.kind].icon, 'c-' + K[x.kind].colour)}<span>${esc(x.name)}</span></button>`;

export function mountAgent(): void {
  $('[data-pa]', pel.agent).innerHTML = `<button class="ib" id="ag-new" title="New conversation">${ico('plus')}</button><button class="ib" id="ag-all" title="Conversations">${ico('clock')}</button>`;
  body('agent').append(el(`<div class="ag">
    <div class="ag-head"><b id="ag-title"></b></div>
    <div class="ag-log" role="log" aria-live="polite" tabindex="-1"></div>
    <div class="ag-list" hidden><input class="in" id="ag-q" placeholder="Search conversations" aria-label="Search conversations"><div class="ag-rows"></div></div>
    <form class="ag-ask"><div class="ag-about"></div><div class="ag-box"><textarea class="in" rows="2" placeholder="Ask about this project" aria-label="Ask the agent"></textarea><button class="ib" id="ag-send" title="Send">${ico('up')}</button></div></form>
  </div>`));
  log = $('.ag-log', pel.agent); list = $('.ag-list', pel.agent); rows = $('.ag-rows', pel.agent); ask = $<HTMLFormElement>('.ag-ask', pel.agent);
  field = $<HTMLTextAreaElement>('textarea', ask); search = $<HTMLInputElement>('#ag-q', pel.agent); title = $('#ag-title', pel.agent);

  $('#ag-new', pel.agent).onclick = () => { S.chat = ''; S.chats = false; renderAgent(); keep(); field.focus(); };
  $('#ag-all', pel.agent).onclick = () => { S.chats = !S.chats; renderAgent(); if (S.chats) search.focus(); };
  search.oninput = renderAgent;

  ask.onsubmit = e => { e.preventDefault(); say(field.value); };
  /* Enter sends, and Shift with Enter starts a new line */
  field.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); say(field.value); } };
  field.oninput = () => { $<HTMLButtonElement>('#ag-send', ask).disabled = sending || !field.value.trim(); };

  pel.agent.addEventListener('click', e => {
    const item = itemAt(hit(e, '[data-i]')?.dataset.i);
    if (item && alive(item)) { openDoc(item); return; }
    const starter = hit(e, '[data-say]');
    if (starter) { say(starter.textContent ?? ''); return; }
    if (hit(e, '[data-about]')) { aboutSelected = !aboutSelected; renderAbout(); return; }
    const more = hit(e, '[data-cm]');
    if (more) { const r = more.getBoundingClientRect(); conversationMenu(more.closest<HTMLElement>('[data-c]')!.dataset.c!, r.left - 110, r.bottom + 3); return; }
    const open = hit(e, '[data-c]');
    if (open) { S.chat = open.dataset.c!; S.chats = false; renderAgent(); keep(); }
  });
  /* the right button on a conversation gives the same menu as its button */
  rows.addEventListener('contextmenu', e => { const row = hit(e, '[data-c]'); if (row) conversationMenu(row.dataset.c!, e.clientX, e.clientY); });

  /* an answer, and what was said in a conversation that was asked for, are shown when they are there */
  project.agent.onChange(renderAgent);
}

function conversationMenu(id: string, x: number, y: number): void {
  const c = project.agent.conversation(id);
  if (!c) return;
  menu([
    { l: 'Open', on: () => { S.chat = id; S.chats = false; renderAgent(); keep(); } },
    { l: 'Rename…', on: () => dialog('Rename Conversation', `<input class="in" name="title" aria-label="Title" value="${esc(c.title)}" style="width:100%">`, 'Rename', dlg => { void act(project.agent.rename(id, $<HTMLInputElement>('input', dlg).value)); }) },
    '-',
    { l: 'Delete', on: () => { void act(project.agent.remove(id)); } },
  ], x, y);
}

/* asks the agent, in the conversation that is open or in a new one */
function say(text: string): void {
  const question = text.trim();
  if (!question || sending) return;
  const about = aboutSelected && selected() !== ROOT ? selected() : undefined, typed = field.value;
  sending = true; pending = question; heldAtSend = S.chat ? project.agent.messages(S.chat)?.length ?? 0 : 0;
  field.value = '';
  S.chats = false;
  renderAgent();
  project.agent.ask(question, S.chat, about).then(id => { S.chat = id; keep(); }, (e: unknown) => { refused(e); if (!field.value) field.value = typed; }).finally(() => { sending = false; renderAgent(); });
}

function renderAbout(): void {
  const x = selected(), whole = x === ROOT;
  $('.ag-about', ask).innerHTML = whole ? `<span class="ag-on">${ico(ROOT.icon || K[ROOT.kind].icon)}<span>About the whole project</span></span>`
    : `<button type="button" class="ag-on${aboutSelected ? '' : ' off'}" data-about aria-pressed="${aboutSelected}" title="${aboutSelected ? 'The question is asked of the selected item. Click to ask of the whole project.' : 'Click to ask of the selected item.'}">${ico(x.icon || K[x.kind].icon)}<span>${aboutSelected ? 'About ' + esc(x.name) : 'About the whole project'}</span></button>`;
}
/* the item a question is asked of follows the selection */
export function agentFollowsSelection(): void { if (ask && !pel.agent.hidden) renderAbout(); }

export function renderAgent(): void {
  const agent = project.agent;
  if (S.chat && !agent.conversation(S.chat) && !sending) { S.chat = ''; keep(); }
  const open = agent.conversation(S.chat);
  $('#ag-all', pel.agent).classList.toggle('on', S.chats);
  list.hidden = !S.chats; log.hidden = ask.hidden = S.chats;
  title.textContent = S.chats ? 'Conversations' : open?.title ?? 'New conversation';

  if (S.chats) {
    const q = search.value.trim().toLowerCase(), found = agent.conversations.filter(c => !q || c.title.toLowerCase().includes(q) || c.last.toLowerCase().includes(q));
    let day = '';
    rows.innerHTML = found.map(c => {
      const head = c.day !== day ? `<div class="ag-day">${esc(day = c.day)}</div>` : '';
      return `${head}<div class="ag-row${c.id === S.chat ? ' on' : ''}" data-c="${c.id}"><button type="button" class="ag-open"><b>${esc(c.title)}</b><small>${esc(c.time)} · ${c.messages} ${c.messages === 1 ? 'message' : 'messages'}</small><span>${esc(c.last)}</span></button><button type="button" class="ib" data-cm title="Rename or delete">${ico('more')}</button></div>`;
    }).join('') || `<div class="hint">${agent.conversations.length ? 'No conversation matches that search.' : 'There are no conversations yet.'}</div>`;
    return;
  }

  const said = open ? agent.messages(open.id) : [], now = `${S.chat}/${said?.length ?? -1}/${open?.answering ?? sending}`;
  if (!open && !sending) {
    log.innerHTML = `<div class="ag-hello">${ico('bot')}<b>Ask the agent about ${esc(ROOT.name)}</b><p>It reads the hierarchy, what validation found and what git says, and answers from that.</p>${STARTERS.map(s => `<button type="button" class="ag-start" data-say>${esc(s)}</button>`).join('')}</div>`;
  } else {
    log.innerHTML = (said ?? []).map(m => `<div class="ag-msg${m.mine ? ' mine' : ''}"><small>${m.mine ? 'You' : 'Agent'} · ${esc(m.time)}</small>${m.steps.length ? `<ul class="ag-steps">${m.steps.map(s => `<li>${ico('check')}${esc(s)}</li>`).join('')}</ul>` : ''}<div class="ag-text">${esc(m.text)}</div>${m.items.some(alive) ? `<div class="ag-items">${m.items.filter(alive).map(chip).join('')}</div>` : ''}</div>`).join('')
      + (sending && (said?.length ?? 0) <= heldAtSend ? `<div class="ag-msg mine"><small>You</small><div class="ag-text">${esc(pending)}</div></div>` : '')
      + (open?.answering || sending ? `<div class="ag-msg ag-wait"><small>Agent</small><div class="ag-dots" aria-label="The agent is answering"><i></i><i></i><i></i></div></div>` : '');
  }
  /* what is new is at the end, so the log shows its end when it changed */
  if (now !== shown) { shown = now; log.scrollTop = log.scrollHeight; }
  field.placeholder = open ? 'Ask a follow-up' : 'Ask about this project';
  $<HTMLButtonElement>('#ag-send', ask).disabled = sending || !field.value.trim() || !!open?.answering;
  renderAbout();
}
