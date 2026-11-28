/* The agent: the conversations a user has with it about the project, the ones that are over included. The list is read when the project opens; what was said in a conversation is read when it is asked for. The agent's answer arrives as a change a moment after the question, so a part that shows a conversation asks to be told. */
import { fromBinary } from '@bufbuild/protobuf';
import { Agent, AgentChangesSchema, Author, type AgentMessage as KeptMessage, type ConversationSummary } from '../gen/adp/storage/v1/agent_pb';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import type { Link } from '../link';
import type { AgentMessage, ConversationInfo, Done, Item } from '../views';
import type { SolutionStore } from './solution';

const info = (c: ConversationSummary): ConversationInfo => ({ id: c.id, title: c.title, day: c.day, time: c.time, messages: c.messages, last: c.last, answering: c.answering });

export class AgentStore {
  revision = 0;
  /* newest first */
  conversations: readonly ConversationInfo[] = [];
  /* what was said in the conversations that were asked for */
  private readonly said = new Map<string, readonly AgentMessage[]>();
  private readonly asked = new Set<string>();
  private readonly listeners = new Set<() => void>();

  constructor(private readonly link: Link, private readonly projectId: string, private readonly solution: SolutionStore) {
    /* only the Agent tool window shows a conversation, so the page as a whole is not told of a change in one */
    link.listen('Agent', projectId, event => this.apply(event), () => this.load(), true);
  }
  async load(): Promise<void> {
    const a = await this.link.call(Agent.method.read, { projectId: this.projectId });
    this.revision = a.revision;
    this.conversations = a.conversations.map(info);
    /* what was held of a conversation may be behind after a break: it is asked for again when it is shown */
    this.said.clear();
    this.tell();
  }

  conversation(id: string): ConversationInfo | undefined { return this.conversations.find(c => c.id === id); }
  /* What was said in a conversation: undefined while it is on its way. A part that gets undefined draws without it, and is told when it is there. */
  messages(id: string): readonly AgentMessage[] | undefined {
    const known = this.said.get(id);
    if (known || this.asked.has(id) || !this.conversation(id)) return known;
    this.asked.add(id);
    this.link.call(Agent.method.readConversation, { projectId: this.projectId, conversationId: id })
      .then(c => { this.said.set(id, c.messages.map(m => this.message(m))); }, () => { /* gone, or the storage is away: it is asked for again when it is shown again */ })
      .finally(() => { this.asked.delete(id); this.tell(); });
    return undefined;
  }

  /* Says something to the agent, in a conversation or to start one, about an item when one is given. Gives the id of the conversation; the answer follows as a change. */
  async ask(text: string, conversationId = '', about?: Item): Promise<string> {
    return (await this.link.call(Agent.method.ask, { projectId: this.projectId, conversationId, text, aboutItemId: about?.id ?? '' })).conversationId;
  }
  rename(id: string, title: string): Promise<Done> { return this.link.call(Agent.method.rename, { projectId: this.projectId, conversationId: id, title }); }
  remove(id: string): Promise<Done> { return this.link.call(Agent.method.delete, { projectId: this.projectId, conversationId: id }); }

  /* told when the list or a conversation changed, and when what was said in one has arrived */
  onChange(listener: () => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    this.revision = event.revision;
    const change = fromBinary(AgentChangesSchema, event.changes);
    this.conversations = change.conversations.map(info);
    if (change.spoken?.about) this.said.set(change.spoken.about.id, change.spoken.messages.map(m => this.message(m)));
    /* what is held of a conversation that is gone, or that has more in it than is held here, is let go */
    for (const [id, held] of this.said) { const now = this.conversation(id); if (!now || now.messages !== held.length) this.said.delete(id); }
    this.tell();
  }
  private message(m: KeptMessage): AgentMessage {
    return { id: m.id, mine: m.author === Author.USER, text: m.text, time: m.time, items: m.itemIds.map(id => this.solution.byId(id)).filter((x): x is Item => !!x), steps: m.steps };
  }
  private tell(): void { for (const l of [...this.listeners]) l(); }
}
