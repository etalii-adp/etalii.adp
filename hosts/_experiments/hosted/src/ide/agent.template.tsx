/* What the Agent tool window looks like: a conversation with the field to ask in, or the list of the conversations there are, and what it adds to the header of its tool window. */
import type { VNode } from 'preact';
import { hit } from '../common/dom';
import { ico } from '../common/icons.template';
import type { AgentMessage, ConversationInfo } from '../storage';
import { K } from './kinds';
import type { Item } from './types';

/* What the log shows: the questions a new conversation offers to start with, or what was said; pending is a question that is on its way, and waiting says that the agent is answering. With it go the field's hint and whether a question can be sent. */
export interface Talk { hello: { project: string; starters: readonly string[] } | null; said: readonly AgentMessage[]; alive: (item: Item) => boolean; pending: string | null; waiting: boolean; hint: string; unsendable: boolean }
/* the conversations that were found, with the one that is open, or why there is none to show */
export interface Listing { found: readonly ConversationInfo[]; open: string; none: string }
/* what a question is asked of: the whole project, or the selected item unless that is switched off */
export interface About { item: Item; whole: boolean; selected: boolean }

/* what the Agent tool window asks for; a conversation is named by its id */
export interface AgentActions {
  search: () => void;
  say: (text: string) => void;
  typed: (text: string) => void;
  about: () => void;
  open: (itemId: string) => void;
  show: (conversation: string) => void;
  more: (conversation: string, button: HTMLElement) => void;
  menu: (conversation: string, x: number, y: number) => void;
}

const Chip = ({ item: x, open }: { item: Item; open: (itemId: string) => void }): VNode =>
  <button type="button" class="ag-item" data-i={x.id} title={`Open ${x.name}`} onClick={() => open(x.id)}>{ico(x.icon || K[x.kind].icon, 'c-' + K[x.kind].colour)}<span>{x.name}</span></button>;

const Log = ({ talk: t, on }: { talk: Talk; on: AgentActions }): VNode =>
  t.hello
    ? <div class="ag-hello">
      {ico('bot')}<b>{`Ask the agent about ${t.hello.project}`}</b>
      <p>It reads the hierarchy, what validation found and what git says, and answers from that.</p>
      {t.hello.starters.map(s => <button type="button" class="ag-start" data-say="" onClick={() => on.say(s)}>{s}</button>)}
    </div>
    : <>
      {t.said.map(m =>
        <div class={'ag-msg' + (m.mine ? ' mine' : '')}>
          <small>{`${m.mine ? 'You' : 'Agent'} · ${m.time}`}</small>
          {m.steps.length ? <ul class="ag-steps">{m.steps.map(s => <li>{ico('check')}{s}</li>)}</ul> : ''}
          <div class="ag-text">{m.text}</div>
          {m.items.some(t.alive) ? <div class="ag-items">{m.items.filter(t.alive).map(x => <Chip item={x} open={on.open} />)}</div> : ''}
        </div>)}
      {t.pending === null ? '' : <div class="ag-msg mine"><small>You</small><div class="ag-text">{t.pending}</div></div>}
      {t.waiting ? <div class="ag-msg ag-wait"><small>Agent</small><div class="ag-dots" aria-label="The agent is answering"><i></i><i></i><i></i></div></div> : ''}
    </>;

const Conversations = ({ listing: { found, open, none }, on }: { listing: Listing; on: AgentActions }): VNode =>
  found.length
    ? <>{found.map((c, i) => <>
      {(i ? found[i - 1].day : '') !== c.day ? <div class="ag-day">{c.day}</div> : ''}
      {/* the right button on a conversation gives the same menu as its button */}
      <div class={'ag-row' + (c.id === open ? ' on' : '')} data-c={c.id} onClick={e => { if (!hit(e, '[data-cm]')) on.show(c.id); }} onContextMenu={e => on.menu(c.id, e.clientX, e.clientY)}>
        <button type="button" class="ag-open"><b>{c.title}</b><small>{`${c.time} · ${c.messages} ${c.messages === 1 ? 'message' : 'messages'}`}</small><span>{c.last}</span></button>
        <button type="button" class="ib" data-cm="" title="Rename or delete" onClick={e => on.more(c.id, e.currentTarget)}>{ico('more')}</button>
      </div>
    </>)}</>
    : <div class="hint">{none}</div>;

/* lists says that the conversations show in place of one conversation; there is no listing before they were asked for */
export const Agent = ({ title, lists, talk, listing, about, on }: { title: string; lists: boolean; talk: Talk; listing: Listing | null; about: About | null; on: AgentActions }): VNode =>
  <div class="ag">
    <div class="ag-head"><b id="ag-title">{title}</b></div>
    <div class="ag-log" role="log" aria-live="polite" tabindex={-1} hidden={lists}><Log talk={talk} on={on} /></div>
    <div class="ag-list" hidden={!lists}>
      <input class="in" id="ag-q" placeholder="Search conversations" aria-label="Search conversations" onInput={on.search} />
      <div class="ag-rows">{listing ? <Conversations listing={listing} on={on} /> : ''}</div>
    </div>
    <form class="ag-ask" hidden={lists} onSubmit={e => { e.preventDefault(); on.say(e.currentTarget.querySelector('textarea')!.value); }}>
      <div class="ag-about">{!about ? '' : about.whole
        ? <span class="ag-on">{ico(about.item.icon || K[about.item.kind].icon)}<span>About the whole project</span></span>
        : <button type="button" class={'ag-on' + (about.selected ? '' : ' off')} data-about="" aria-pressed={about.selected} onClick={on.about}
          title={about.selected ? 'The question is asked of the selected item. Click to ask of the whole project.' : 'Click to ask of the selected item.'}>
          {ico(about.item.icon || K[about.item.kind].icon)}<span>{about.selected ? 'About ' + about.item.name : 'About the whole project'}</span>
        </button>}</div>
      <div class="ag-box">
        {/* Enter sends, and Shift with Enter starts a new line */}
        <textarea class="in" rows={2} placeholder={talk.hint} aria-label="Ask the agent" onInput={e => on.typed(e.currentTarget.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); on.say(e.currentTarget.value); } }} />
        <button class="ib" id="ag-send" title="Send" disabled={talk.unsendable}>{ico('up')}</button>
      </div>
    </form>
  </div>;

/* what the Agent adds to the header of its tool window; lists says that the conversations show */
export const AgentButtons = ({ lists, fresh, all }: { lists: boolean; fresh: () => void; all: () => void }): VNode =>
  <>
    <button class="ib" id="ag-new" title="New conversation" onClick={fresh}>{ico('plus')}</button>
    <button class={'ib' + (lists ? ' on' : '')} id="ag-all" title="Conversations" onClick={all}>{ico('clock')}</button>
  </>;

/* what the dialog that renames a conversation asks */
export const RenameConversation = ({ title }: { title: string }): VNode =>
  <input class="in" name="title" aria-label="Title" value={title} style="width:100%" />;
