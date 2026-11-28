/* What a canvas looks like: a card per child item on a plane, the arrows between them, and the controls in its corners. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.template';
import { K } from './kinds';
import { sev } from './severity';
import { Arrow } from './tools/shared.template';
import type { Item, Point, ToolName, View } from './types';

/* the small picture on the card of an item, by its tool */
const THUMB: Partial<Record<ToolName, () => VNode>> & { doc: () => VNode } = {
  flow: () => <><rect x="4" y="12" width="40" height="16" rx="3" /><rect x="76" y="12" width="40" height="16" rx="3" /><rect x="148" y="12" width="40" height="16" rx="3" /><path d="M44 20h32M116 20h32" /></>,
  onto: () => <><rect x="8" y="2" width="46" height="14" rx="3" /><rect x="134" y="2" width="46" height="14" rx="3" /><rect x="70" y="24" width="46" height="14" rx="3" /><path d="M54 9h80M40 16l40 8M150 16l-40 8" /></>,
  page: () => <><rect x="4" y="2" width="184" height="8" rx="2" /><rect x="4" y="15" width="184" height="12" rx="2" /><rect x="4" y="32" width="56" height="8" rx="2" /><rect x="68" y="32" width="56" height="8" rx="2" /><rect x="132" y="32" width="56" height="8" rx="2" /></>,
  dash: () => <><path d="M4 36l30-16 30 8 34-22 30 12 30-10 30 6" /><path d="M4 39h184" opacity=".5" /></>,
  form: () => <path d="M4 6h40M60 6h128M4 20h40M60 20h128M4 34h40M60 34h80" />,
  schema: () => <path d="M4 3h184v36H4zM4 15h184M4 27h184M70 3v36M130 3v36" />,
  check: () => <path d="M6 8l4 4 7-8M28 8h150M6 22l4 4 7-8M28 22h120M8 34h6M28 36h140" />,
  doc: () => <path d="M4 5h90M4 15h184M4 24h170M4 33h120" />,
  code: () => <path d="M4 5h60M20 14h120M20 23h90M4 32h40" />,
};

/* the card of an item: what it is, and what it holds, its attributes or a picture of its tool */
const Card = ({ item: k, place, at, selected }: { item: Item; place: number; at: Point; selected: boolean }): VNode => {
  const sv = sev(k), t = K[k.kind];
  return <div class={'card' + (selected ? ' on' : '')} data-id={k.id} data-i={place} style={`left:${at.x}px;top:${at.y}px`}>
    <div class="ch">{ico(k.icon || t.icon, 'c-' + t.colour)}<b class={k.vcs ? 'nm v' + k.vcs : ''}>{k.name}</b>{sv ? <span class={'dot ' + sv}></span> : ''}</div>
    <div class="ck">{`${t.label}${k.children ? ' · ' + k.children.length + ' items' : ''}`}{k.link ? <span class="ref">{ico('link')}{k.link.ref}</span> : ''}</div>
    {k.children
      ? <ul>
        {k.children.slice(0, 5).map(q => <li>{ico(q.icon || K[q.kind].icon, 'c-' + K[q.kind].colour)}{q.name}</li>)}
        {k.children.length > 5 ? <li class="more">{`and ${k.children.length - 5} more`}</li> : ''}
        {k.children.length ? '' : <li class="more">Empty</li>}
      </ul>
      : k.attrs
        ? <ul>
          {k.attrs.slice(0, 4).map(a => <li class="mono">{a}</li>)}
          {k.attrs.length > 4 ? <li class="more">{`and ${k.attrs.length - 4} more`}</li> : ''}
          {k.attrs.length ? '' : <li class="more">No attributes yet</li>}
        </ul>
        : <div class="th"><svg viewBox="0 0 192 42" preserveAspectRatio="xMinYMid meet">{((t.tool && THUMB[t.tool]) || THUMB.doc)()}</svg></div>}
  </div>;
};

/* what the canvas asks for: what the pointer, the wheel and the keys do on the plane get the event, for where it happened and with what; the buttons say what they are for */
export interface CanvasActions {
  press: (e: PointerEvent) => void;
  wheel: (e: WheelEvent) => void;
  menu: (e: MouseEvent) => void;
  key: (e: KeyboardEvent) => void;
  up: () => void;
  animate: () => void;
  zoom: (by: number) => void;
  fit: () => void;
  shared: () => void;
}

/* at says where each card is, by its place among the items; view is how far the plane is moved and zoomed, and panning says that it is being moved now; paths are the arrows between the cards, which follow from how large the cards turned out */
export const Canvas = ({ level: L, items, at, view: V, panning, paths, selected, animated, on }: {
  level: Item; items: readonly Item[]; at: readonly Point[]; view: View; panning: boolean; paths: readonly string[]; selected: Item; animated: boolean; on: CanvasActions;
}): VNode =>
  <>
    <div class={'cv' + (panning ? ' pan' : '')} tabindex={0} aria-label={`Canvas of ${L.name}`} style={{ backgroundSize: `${24 * V.k}px ${24 * V.k}px`, backgroundPosition: `${V.x}px ${V.y}px` }}
      onPointerDown={on.press} onWheel={on.wheel} onContextMenu={on.menu} onKeyDown={on.key}>
      <div class="plane" style={{ transform: `translate(${V.x}px,${V.y}px) scale(${V.k})` }}>
        <svg><Arrow /><g id="cv-e">{paths.map(d => <path marker-end="url(#ar)" d={d} />)}</g></svg>
        {items.map((k, i) => <Card key={k.id} item={k} place={i} at={at[i]} selected={k === selected} />)}
      </div>
      {items.length ? '' : <div class="hint" style="position:absolute;inset:0;display:grid;place-items:center">{`${L.name} is empty. Right-click it in the Explorer and choose New.`}</div>}
    </div>
    <div class="cv-tl"><button class="ib" id="cv-up" title="Up one level" disabled={!L.parent} onClick={on.up}>{ico('up')}</button><span>{L.name}</span></div>
    {/* nothing is said of a layout that is the shared one: the note is there only with the way back to it */}
    <div class="cv-bl" id="cv-note" hidden={!L.own}>{L.own ? <>Your own layout, saved in .user.adp. <button id="cv-reset" onClick={on.shared}>Use shared layout</button></> : ''}</div>
    <div class="cv-br">
      <button class={'ib' + (animated ? ' on' : '')} id="cv-an" title="Animate moving between levels: a short zoom when going deeper or higher, a short slide between neighbours" aria-pressed={animated} onClick={on.animate}>{ico('motion')}</button>
      <button class="ib" id="cv-out" title="Zoom out" onClick={() => on.zoom(1 / 1.2)}>{ico('minus')}</button>
      <span class="zl" id="cv-z">{`${Math.round(V.k * 100)}%`}</span>
      <button class="ib" id="cv-in" title="Zoom in" onClick={() => on.zoom(1.2)}>{ico('plus')}</button>
      <button class="tbtn" style="height:24px" id="cv-fit" onClick={on.fit}>Fit</button>
    </div>
  </>;
