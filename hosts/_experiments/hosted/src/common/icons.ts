/* The icon set, 16px strokes, and the ADP mark. */
import { $$, el } from './dom';
import { base } from './pages';

export const c=(x:number,y:number,r:number):string=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;

/* a page that needs more icons adds them with addIcons (see ide/icon-library.ts) */
export const I:Record<string,string>={
folder:'<path d="M1.5 3.5h4.5l1.5 2h7v7.5h-13z"/>',file:'<path d="M4 1.5h5l3 3v10H4zM9 1.5v3h3"/>',
cube:'<path d="M8 1.5l5.5 3v7L8 14.5l-5.5-3v-7zM2.5 4.5L8 7.5l5.5-3M8 7.5v7"/>',
inbox:'<path d="M2 9l2-6h8l2 6v4H2zM2 9h3.5l1 2h3l1-2H14"/>',
graph:'<path d="M5 5l2.3 5.2M11 5l-2.3 5.2M5.8 3.5h4.4"/>'+c(4,3.5,1.8)+c(12,3.5,1.8)+c(8,12,1.8),
sparkle:'<path d="M8 1.5l1.6 4.9 4.9 1.6-4.9 1.6L8 14.5 6.4 9.6 1.5 8l4.9-1.6z"/>',
chart:'<path d="M2 14h12M4 11.5V8M8 11.5V3M12 11.5V6"/>',
globe:c(8,8,6.5)+'<path d="M1.5 8h13M8 1.5c-3 3.5-3 9.5 0 13M8 1.5c3 3.5 3 9.5 0 13"/>',
puzzle:'<path d="M2.5 5h3a1.6 1.6 0 113 0h3v3a1.6 1.6 0 110 3v2.5h-9z"/>',
rocket:'<path d="M9 2c3 0 5 2 5 5l-5.5 5-3.500-3.500zM5 8.500l-3 .5 2.500-2.500M7.500 11l-.5 3 2.500-2.500M2.500 13.500l1.500-1.500"/>'+c(10.3,5.7,1),
shield:'<path d="M8 1.500l5.500 2v4c0 3.500-2.500 6-5.500 7-3-1-5.500-3.500-5.500-7v-4zM5.500 8l2 2 3.500-4"/>',
book:'<path d="M3 2.500h9.500v11H4a1 1 0 01-1-1zM3 11.500h9.500M6 5.500h4"/>',
plug:'<path d="M6 1.500v3M10 1.500v3M4 4.500h8v3a4 4 0 01-8 0zM8 11.500v3"/>',
flow:'<path d="M1.500 2.500h4.500v3.500H1.500zM10 10h4.500v3.500H10zM6 4.250h2.500v7.500H10"/>',
braces:'<path d="M6 2c-2 0-2 1-2 2.500S4 7.500 2.500 8C4 8.500 4 9.500 4 11.500S4 14 6 14M10 2c2 0 2 1 2 2.500s0 3 1.500 3.500c-1.500.5-1.500 1.500-1.500 3.500s0 2.500-2 2.500"/>',
list:'<path d="M2.500 4h1M6 4h8M2.500 8h1M6 8h8M2.500 12h1M6 12h8"/>',
chip:'<path d="M4.500 4.500h7v7h-7zM6.500 1.500v3M9.500 1.500v3M6.500 11.500v3M9.500 11.500v3M1.500 6.500h3M1.500 9.500h3M11.500 6.500h3M11.500 9.500h3"/>',
chat:'<path d="M2 3h12v8H7l-3 3v-3H2z"/>',
bot:'<path d="M3 6h10v7H3zM8 3.800V6M6 9.500h.01M10 9.500h.01"/>'+c(8,2.8,1),
beaker:'<path d="M6 1.500h4M6.500 1.500v4L3 13.500h10L9.500 5.500v-4M5 10h6"/>',
notebook:'<path d="M4 1.500h9v13H4zM2.500 4.500h3M2.500 8h3M2.500 11.500h3"/>',
window:'<path d="M1.500 3h13v10h-13zM1.500 6h13M3.500 4.500h.01M5.500 4.500h.01"/>',
palette:'<path d="M8 1.500a6.500 6.500 0 100 13c1 0 1.500-.6 1.500-1.300 0-1.200 1-1.700 2-1.700h1c1 0 2-1 2-3 0-4-3-7-6.500-7zM5 8h.01M6.500 5h.01M10 5h.01"/>',
server:'<path d="M2 2.500h12V7H2zM2 9h12v4.500H2zM4.500 4.800h.01M4.500 11.300h.01"/>',
check:'<path d="M2.500 8.500L6 12l7.500-8"/>',
clipboard:'<path d="M4 3h8v11H4zM6 1.500h4v3H6zM6 8h4M6 11h4"/>',
doc:'<path d="M4 1.500h5l3 3v10H4zM6 8h4M6 11h4"/>',
code:'<path d="M5.500 4.500L2 8l3.500 3.500M10.500 4.500L14 8l-3.500 3.500"/>',
branch:'<path d="M4.500 5v6M4.500 11c0-3.500 7-1.500 7-5"/>'+c(4.5,3.5,1.5)+c(4.5,12.5,1.5)+c(11.5,4.5,1.5),
link:'<path d="M6.500 9.500l3-3M7 4.500L8.500 3A2.500 2.500 0 0112 6.500L10.500 8M9 11.500L7.500 13A2.500 2.500 0 014 9.500L5.500 8"/>',
eye:'<path d="M1.500 8S4 3.500 8 3.500 14.500 8 14.500 8 12 12.500 8 12.500 1.500 8 1.500 8z"/>'+c(8,8,2),
search:c(7,7,4.5)+'<path d="M10.500 10.500l4 4"/>',
gear:c(8,8,1.7)+c(8,8,4.4)+'<path d="M8 1.500v2M8 12.500v2M1.500 8h2M12.500 8h2M3.400 3.400l1.400 1.400M11.200 11.200l1.400 1.400M3.400 12.600l1.400-1.400M11.200 4.800l1.400-1.400"/>',
more:'<path d="M8 3.500h.01M8 8h.01M8 12.500h.01" stroke-width="2"/>',minus:'<path d="M3.500 8h9"/>',
chev:'<path d="M6 3.500L10.500 8 6 12.500"/>',plus:'<path d="M8 3v10M3 8h10"/>',x:'<path d="M4 4l8 8M12 4l-8 8"/>',
commit:c(8,8,3)+'<path d="M1.500 8H5M11 8h3.500"/>',
props:'<path d="M2 4.500h6.500M12 4.500h2M2 11.500h2M7.500 11.500H14"/>'+c(10.3,4.5,1.6)+c(5.7,11.5,1.6),
warning:'<path d="M8 2l6.500 11.500h-13zM8 6.500V10M8 12h.01"/>',error:c(8,8,6.2)+'<path d="M8 4.500v4M8 11h.01"/>',info:c(8,8,6.2)+'<path d="M8 7.500v4M8 5h.01"/>',
down:'<path d="M8 2.500v10M4 9l4 4 4-4"/>',up:'<path d="M8 13.500v-10M4 7l4-4 4 4"/>',
fetch:'<path d="M3 7.500a5 5 0 019-2.500M12.500 2.500V5.500h-3M13 8.500a5 5 0 01-9 2.500M3.500 13.500v-3h3"/>',
play:'<path d="M4.500 2.500l8 5.500-8 5.500z" fill="currentColor"/>',
canvas:'<path d="M2 2h5v5H2zM9 9h5v5H9zM9 2h5v3H9zM2 10h5v4H2z"/>',edit:'<path d="M3 13l.5-3L11 2.500l2.500 2.500L6 12.500zM9.500 4l2.500 2.500"/>',
target:c(8,8,5.5)+c(8,8,1.2),collapse:'<path d="M4 6l4-3.500L12 6M4 10l4 3.500 4-3.500"/>',
motion:'<path d="M1.500 5h4M1.500 8h2.500M1.500 11h4"/><rect x="8" y="4.500" width="6" height="7" rx="1.300"/>',
menu:'<path d="M2 4h12M2 8h12M2 12h12"/>',filter:'<path d="M2 3h12l-4.500 5.500V13l-3-1.500V8.500z"/>',tagi:'<path d="M2 2h6l6 6-6 6-6-6zM5 5h.01"/>',
clock:c(8,8,6.2)+'<path d="M8 4.500V8l2.500 1.500"/>',
user:c(8,5.5,2.8)+'<path d="M2.500 14c.5-3 2.500-4.500 5.500-4.500s5 1.500 5.500 4.500"/>',lock:'<path d="M4 7h8v6.500H4zM5.500 7V5a2.500 2.500 0 015 0v2"/>'
};

export const addIcons = (more: Record<string, string>): void => { Object.assign(I, more); };
export const ico = (name: string, cls = ''): string => `<svg class="i ${cls}" viewBox="0 0 16 16" aria-hidden="true">${I[name] || I.file}</svg>`;

/* The ADP mark: the icon of the ADP site, common/img/adp-icon.svg, shown as it is. */
const markSrc = base + 'common/img/adp-icon.svg';
const mark = (size: string): string => `<img src="${markSrc}" width="${size}" height="${size}" alt="ADP" decoding="sync" draggable="false">`;

/* every .logo-slot on the page gets the mark at its data-size, and the browser tab gets it too */
export function mountMark(): void {
  $$('.logo-slot').forEach(slot => { slot.innerHTML = mark(slot.dataset.size ?? '24'); });
  document.head.append(el(`<link rel="icon" type="image/svg+xml" href="${markSrc}">`));
}
