/* Designer: portal pages, shown as they will look. */
import { $, $$, esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { PAGE, type BlockName } from '../data/pages';
import { find } from '../model';
import { inspect } from '../open';
import type { Item } from '../types';
import { tbar, type Tool } from './shared';

/* what each section of a page is called */
const BL: Record<BlockName, string> = { nav: 'Header', hero: 'Hero', cards: 'Card grid', map: 'Map', chart: 'Chart', form: 'Form', table: 'Table', footer: 'Footer', title: 'Heading', drop: 'Empty section' };

function block(t: BlockName, x: Item): string {
  switch (t) {
    case 'nav': return `<div class="b-nav" style="display:flex"><b>Atlas Energy</b><span>Home</span><span>Outage map</span><span>My usage</span><span>Report an outage</span><span class="fake">Sign in</span></div>`;
    case 'hero': return `<div class="b-hero" style="margin:-14px -20px"><h2>Is the power on in your street?</h2><p>Check live outages, follow repairs and see when power is expected back.</p><div class="rowf"><span class="fin">Postcode</span><span class="fake">Check</span></div></div>`;
    case 'cards': return `<div class="b-cards"><div><b>3 active outages</b><p>Affecting 412 homes in the North region</p></div><div><b>My usage</b><p>7.4 kWh today, 12% below last week</p></div><div><b>Report a problem</b><p>Tell us about an outage or a damaged cable</p></div></div>`;
    case 'title': return `<h2>${esc(x.name)}</h2><p>${x.name === 'Outage map' ? 'Live outages and planned work in your region.' : x.name === 'My usage' ? 'Your electricity use per day, from your smart meter.' : x.name === 'Admin console' ? 'Open reports and their handling status.' : 'Tell us what you see. We reply within the hour.'}</p>`;
    case 'map': return `<div class="b-map"><svg viewBox="0 0 600 190"><path d="M30 40l120-20 90 40 60-30 130 20 120 60-60 70-170 0-90-30-120 20-70-50z" fill="#dfe7ee" stroke="#c3ced9"/><path d="M150 20l90 40-20 60-110 10M300 30l-20 90 110 40M430 50l-60 100" fill="none" stroke="#c3ced9"/><g fill="#d6453d"><circle cx="190" cy="80" r="7"/><circle cx="330" cy="120" r="7"/><circle cx="470" cy="100" r="7"/></g><g fill="#e0a100"><circle cx="110" cy="110" r="5"/><circle cx="400" cy="70" r="5"/></g></svg>${x.name === 'Outage map' ? `<span class="warnb">No data binding. Bind this map to Grid topology to show live outages.</span>` : ''}</div>`;
    case 'table': return `<table class="ptable"><thead><tr><th>Area</th><th>Since</th><th>Homes</th><th>Status</th><th>Expected back</th></tr></thead><tbody><tr><td>North, Elm Park</td><td>09:12</td><td>236</td><td>Crew on site</td><td>12:30</td></tr><tr><td>North, Harbour Road</td><td>10:40</td><td>148</td><td>Fault located</td><td>13:15</td></tr><tr><td>South, Mill Lane</td><td>11:05</td><td>28</td><td>Reported</td><td>To be confirmed</td></tr></tbody></table>`;
    case 'chart': return `<div class="pbars" style="margin-bottom:20px">${([['Mon', 62], ['Tue', 71], ['Wed', 58], ['Thu', 80], ['Fri', 66], ['Sat', 92], ['Sun', 74]] as [string, number][]).map(([dn, v]) => `<div style="height:${v}%"><span>${dn}</span></div>`).join('')}</div>`;
    case 'form': return `<div class="b-form"><label>Postcode<span class="fin">1234 AB</span></label><label>House number<span class="fin">12</span></label><label>What do you see?<span class="fin">No power in the whole street</span></label><label>Contact number<span class="fin">Optional</span></label></div><p style="margin-top:12px"><span class="fake">${x.name === 'Sign-in page' ? 'Sign in' : 'Send report'}</span></p>`;
    case 'footer': return `<div>Atlas Energy · Privacy · Accessibility · Contact</div>`;
    default: return `<div>Drag a component here.</div>`;
  }
}

export const rPage: Tool = (d, x) => {
  const empty: BlockName[] = ['nav', 'drop'], bs = x.fresh ? empty : PAGE[x.name] || empty;
  const ds = find('Design system'), components = (ds?.children || []).filter(k => k.kind === 'component'), from = 'Design system @ ' + (ds?.link?.ref ?? '');
  d.innerHTML = `<div class="tool">${tbar(x, `<span>${bs.length} sections</span><span class="sp"></span><div class="seg" id="pg-dev"><button class="on" data-w="880">Desktop</button><button data-w="620">Tablet</button><button data-w="360">Phone</button></div>`)}<div class="tbody"><div class="tbox"><h4>Components</h4>${components.map(k => `<div>${ico('puzzle', 'c-purple')}${esc(k.name)}</div>`).join('')}<div>${ico('puzzle', 'c-purple')}Table</div><div>${ico('puzzle', 'c-purple')}Footer</div><small>From ${esc(from)}</small></div><div class="pgwrap"><div class="pg" id="pg">${bs.map((t, i) => `<div class="bk ${t === 'footer' ? 'b-foot' : t === 'drop' ? 'b-drop' : t === 'nav' ? 'b-nav-w' : ''}" data-el="${i}"><span class="bl">${BL[t]}</span>${block(t, x)}</div>`).join('')}</div></div></div></div>`;
  const page = $('#pg');
  $('#pg-dev').onclick = e => {
    const b = hit(e, 'button');
    if (!b) return;
    $$('#pg-dev button').forEach(k => k.classList.toggle('on', k === b));
    page.style.maxWidth = b.dataset.w + 'px';
  };
  page.onclick = e => {
    const b = hit(e, '.bk');
    if (!b) return;
    $$('.bk', d).forEach(k => k.classList.toggle('on', k === b));
    const at = Number(b.dataset.el), t = bs[at], unbound = t === 'map' && x.name === 'Outage map';
    inspect({ icon: 'puzzle', title: BL[t], sub: 'Section on ' + x.name, g: [['Component', [['Name', BL[t]], ['From', from], ['Position', (at + 1) + ' of ' + bs.length]]], ['Data', [['Binding', unbound ? 'None' : t === 'table' || t === 'map' || t === 'chart' || t === 'cards' ? 'Data analysis / Outage heatmap' : 'Static', unbound ? 1 : 0], ['Refresh', t === 'table' || t === 'map' ? 'Every 60 s' : 'On load']]], ['Layout', [['Width', 'Full'], ['Spacing', 'Comfortable'], ['Visible on', 'Desktop, tablet, phone']]]] });
  };
};
