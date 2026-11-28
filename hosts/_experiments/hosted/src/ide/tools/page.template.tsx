/* What the designer of portal pages looks like: the components it offers, and the page as it will look, section by section. */
import type { VNode } from 'preact';
import { esc } from '../../common/dom';
import { ico } from '../../common/icons.template';
import type { DeepReadonly, Item, PageDocument } from '../types';
import { ToolBar } from './shared.template';

type Section = DeepReadonly<PageDocument['sections'][number]>;
/* the widths the page can be looked at in */
const DEVICES: readonly (readonly [width: number, name: string])[] = [[880, 'Desktop'], [620, 'Tablet'], [360, 'Phone']];

/* A section of the page. The storage keeps what a section shows as HTML, so the section is handed to its element as that, with its name before it. */
const SectionBox = ({ section: s, at, on, pick }: { section: Section; at: number; on: boolean; pick: () => void }): VNode =>
  <div class={'bk' + (s.type === 'footer' ? ' b-foot' : s.type === 'drop' ? ' b-drop' : s.type === 'nav' ? ' b-nav-w' : '') + (on ? ' on' : '')} data-el={at} onClick={pick}
    dangerouslySetInnerHTML={{ __html: `<span class="bl">${esc(s.name)}</span>${s.html}` }} />;

/* width is the width the page was set to, and none before one was chosen; picked is the section that was clicked, by its place */
export const Page = ({ item, sections, components, from, width, picked, setWidth, pick }: {
  item: Item; sections: readonly Section[]; components: readonly string[]; from: string; width: number | null; picked: number; setWidth: (width: number) => void; pick: (section: number) => void;
}): VNode =>
  <div class="tool">
    <ToolBar item={item}>
      <span>{`${sections.length} sections`}</span>
      <span class="sp"></span>
      <div class="seg" id="pg-dev">{DEVICES.map(([w, name]) => <button class={w === (width ?? DEVICES[0][0]) ? 'on' : ''} data-w={w} onClick={() => setWidth(w)}>{name}</button>)}</div>
    </ToolBar>
    <div class="tbody">
      <div class="tbox"><h4>Components</h4>{components.map(k => <div>{ico('puzzle', 'c-purple')}{k}</div>)}{from ? <small>{`From ${from}`}</small> : ''}</div>
      <div class="pgwrap">
        <div class="pg" id="pg" style={width ? `max-width:${width}px` : undefined}>
          {sections.map((s, i) => <SectionBox section={s} at={i} on={i === picked} pick={() => pick(i)} />)}
        </div>
      </div>
    </div>
  </div>;
