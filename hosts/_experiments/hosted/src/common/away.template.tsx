/* The notice a page shows when the storage does not answer while the page starts. */
import type { VNode } from 'preact';

/* the form is the dialog itself; the typings of JSX give a form fewer roles than a page may use */
const alertdialog = 'alertdialog' as never;

export const Away = ({ why, again }: { why: string; again: () => void }): VNode =>
  <div class="veil">
    <form class="dlg" role={alertdialog} aria-labelledby="away-t" onSubmit={e => { e.preventDefault(); again(); }}>
      <h2 id="away-t">No connection to the storage</h2>
      <p style="margin:0;color:var(--muted)">{why} What this page shows is kept there, so there is nothing to show yet.</p>
      <div class="acts"><button class="btn pri">Try Again</button></div>
    </form>
  </div>;
