/* What the login page draws itself: the git providers that can confirm who you are. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.tsx';

/* choose gets the provider that was clicked */
export const Providers = ({ names, choose }: { names: readonly string[]; choose: (name: string) => void }): VNode =>
  <>{names.map(name => <button class="btn" type="button" data-provider={name} onClick={() => choose(name)}>{ico('branch', 'c-muted')}{name}</button>)}</>;
