/* The parts of the IDE page that are drawn from its state. A part that changes the state asks for the parts that show it to be drawn again, without knowing the modules that draw them; main.ts says which function draws which part. */

/* marks is the selected item as the document area marks it, without the open item being drawn again */
export type Part = 'explorer' | 'editor' | 'properties' | 'status' | 'title' | 'problems' | 'commit' | 'git' | 'agent' | 'marks';

const painters: Partial<Record<Part, () => void>> = {};
/* run after parts were drawn: the window's state may have changed with them */
let after: (() => void) | null = null;

export function paints(by: Record<Part, () => void>, then: () => void): void { Object.assign(painters, by); after = then; }
export function repaint(...parts: Part[]): void { for (const part of parts) painters[part]?.(); after?.(); }
/* everything that shows the hierarchy, the selection or the open document; the Git tool window is among them for the linked repositories it lists */
export function repaintAll(): void { repaint('explorer', 'editor', 'properties', 'status', 'git'); }
/* every part, as after a change the page did not make itself */
export function repaintEverything(): void { repaint('title', 'problems', 'commit', 'git', 'explorer', 'properties', 'status', 'editor', 'agent'); }
