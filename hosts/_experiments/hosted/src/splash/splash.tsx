/* What the start page draws itself: the buttons that turn the cloud to one way of seeing. */
import type { VNode } from 'preact';

/* shown is the way the cloud shows now; choose gets the one that was clicked */
export const Ways = ({ names, shown, choose }: { names: readonly string[]; shown: number; choose: (way: number) => void }): VNode =>
  <>{names.map((name, i) => <button data-i={i} aria-pressed={i === shown} class={i === shown ? 'on' : ''} onClick={() => choose(i)}>{name}</button>)}</>;
