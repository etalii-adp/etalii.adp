/* What the designer of test suites, evaluation sets and validation procedures looks like. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.template';
import type { CheckDocument, DeepReadonly, Item } from '../types';
import { ToolBar } from './shared.template';

/* column is what a row is called for this kind of item; run starts every row */
export const Check = ({ item, doc, column, run }: { item: Item; doc: DeepReadonly<CheckDocument> | null; column: string; run: () => void }): VNode => {
  const rows = doc?.rows ?? [], passed = rows.filter(r => r[1] === 'Passed').length;
  return <div class="tool">
    <ToolBar item={item}>
      <span>{`${passed} of ${rows.length} passed${doc?.lastRun ? ' · ' + doc.lastRun : ''}`}</span>
      <span class="sp"></span>
      <button class="btn" style="height:24px" id="c-run" onClick={run}>{ico('play', 'c-green')}Run All</button>
    </ToolBar>
    <div class="scroll">
      {rows.length
        ? <table class="grid">
          <thead><tr><th>{column}</th><th>Result</th><th>Owner</th><th>Duration</th></tr></thead>
          <tbody>{rows.map((r, i) =>
            <tr>
              <td>{r[0]}</td>
              <td><span class={'pill ' + (r[1] === 'Passed' ? 'ok' : r[1] === 'Failed' ? 'bad' : 'wait')}>{r[1]}</span></td>
              <td>{r[2] ? r[2] : <span class="bad">No owner</span>}</td>
              <td class="wait">{r[1] === 'Not run' ? '' : (1.2 + i * .7).toFixed(1) + ' s'}</td>
            </tr>)}</tbody>
        </table>
        : <div class="hint">{`Nothing to check yet. Add the first ${column.toLowerCase()}.`}</div>}
    </div>
  </div>;
};
