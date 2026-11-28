/* The trail through the document area: what it showed, in the order it was shown, so a step back shows what showed before and a step forward what was stepped back from. Kept while the page is open. */
import { byId } from './model';
import type { DocMode, Item } from './types';

/* a place on the trail: an item by its id, and whether it showed in its tool or as a canvas */
type Place = `${string} ${DocMode}`;
/* as many places as a person can find the way back through */
const LONGEST = 60;

let trail: Place[] = [], at = -1;

/* Notes what the document area shows. Something else than the place the trail is at goes behind it, and what was stepped back from is forgotten, as the forward of a browser is after a new page. */
export function visited(x: Item, mode: DocMode): void {
  const now: Place = `${x.id} ${mode}`;
  if (trail[at] === now) return;
  trail = [...trail.slice(Math.max(0, at + 2 - LONGEST), at + 1), now];
  at = trail.length - 1;
}

/* The place one step back (-1) or forward (1) on the trail, and the trail is there from now on; places whose item is gone are stepped over. Null at either end. */
export function step(by: -1 | 1): { item: Item; mode: DocMode } | null {
  for (let i = at + by; i >= 0 && i < trail.length; i += by) {
    const [id, mode] = trail[i].split(' ') as [string, DocMode], item = byId(id);
    if (item) { at = i; return { item, mode }; }
  }
  return null;
}
