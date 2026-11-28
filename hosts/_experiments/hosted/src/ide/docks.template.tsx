/* What a tool window and the stripes beside the docks look like. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.template';

/* a tool window: its header with what it adds itself (data-pa), and where it draws its content; more gets the button that asks where the tool window goes */
export const Panel = ({ id, title, hide, more }: { id: string; title: string; hide: () => void; more: (button: HTMLElement) => void }): VNode =>
  <section class="panel" data-panel={id}>
    <header class="ph">
      <b>{title}</b>
      <span data-pa="" style="display:flex;gap:2px"></span>
      <button class="ib" data-pm="" title="Move or hide this tool window" onClick={e => more(e.currentTarget)}>{ico('more')}</button>
      <button class="ib" data-hide="" title="Hide" onClick={hide}>{ico('minus')}</button>
    </header>
    <div class="pb"></div>
  </section>;

/* the button of a tool window on a stripe */
export interface StripeButton { id: string; title: string; icon: string; on: boolean }
/* a stripe holds the buttons of one dock, or of two docks one above the other; toggle gets the tool window whose button was clicked */
export const Stripe = ({ docks, toggle }: { docks: readonly (readonly StripeButton[])[]; toggle: (id: string) => void }): VNode =>
  <>{docks.map(buttons => <div>{buttons.map(b => <button key={b.id} class={'sb' + (b.on ? ' on' : '')} data-tw={b.id} title={b.title} aria-label={b.title} onClick={() => toggle(b.id)}>{ico(b.icon)}</button>)}</div>)}</>;
