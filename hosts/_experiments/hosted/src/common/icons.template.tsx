/* How an icon of the icon set is drawn, and the ADP mark. */
import type { VNode } from 'preact';
import { I } from './icons';
import { base } from './pages';

/* an icon by its name, with the classes that colour it; a name the set lacks shows as a file */
export const ico = (name: string, cls = ''): VNode => <svg class={'i ' + cls} viewBox="0 0 16 16" aria-hidden="true" dangerouslySetInnerHTML={{ __html: I[name] || I.file }} />;

/* The ADP mark: the icon of the ADP site, common/img/adp-icon.svg, shown as it is. */
const markSrc = base + 'common/img/adp-icon.svg';
export const Mark = ({ size }: { size: string }): VNode => <img src={markSrc} width={size} height={size} alt="ADP" decoding="sync" draggable={false} />;
/* the mark as the icon of the browser tab */
export const MarkAsPageIcon = (): VNode => <link rel="icon" type="image/svg+xml" href={markSrc} />;
