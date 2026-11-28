/* What the contents list of a container looks like. */
import type { VNode } from 'preact';
import { ico } from '../../common/icons.template';
import { K } from '../kinds';
import type { Item } from '../types';

const icon = (k: Item): string => k.pseudo ? (k.entries ? 'folder' : 'file') : k.icon || K[k.kind].icon;
const git = (k: Item): string => k.vcs === 'M' ? 'Modified' : k.vcs === 'A' ? 'Added' : k.ignored ? 'Ignored' : '';

/* name is what holds the rows; open gets the item of the row that was clicked */
export const Contents = ({ name, rows, open }: { name: string; rows: readonly Item[]; open: (x: Item) => void }): VNode =>
  <div class="tool">
    <div class="tb"><span class="tk">{`Contents · ${name}`}</span><span>{`${rows.length} items`}</span></div>
    <div class="scroll">
      <table class="grid">
        <thead><tr><th>Name</th><th>Kind</th><th>ID</th><th>Items</th><th>Git</th></tr></thead>
        <tbody>{rows.map(k =>
          <tr key={k.id} class="clk" data-id={k.id} onClick={() => open(k)}>
            <td>{ico(icon(k), 'c-' + K[k.kind].colour)}{k.name}</td>
            <td class="wait">{k.entries ? 'Folder' : K[k.kind].label}</td>
            <td class="mono wait">{k.id}</td>
            <td class="wait">{(k.entries ?? k.children)?.length ?? ''}</td>
            <td class={k.vcs === 'A' ? 'ok' : k.ignored ? 'wait' : ''} style={k.vcs === 'M' ? 'color:var(--blue)' : undefined}>{git(k)}</td>
          </tr>)}</tbody>
      </table>
    </div>
  </div>;
