/* The parts of the IDE page that are drawn from its state. A part that changes the state asks for the parts that show it to be drawn again, without knowing the modules that draw them; main.ts says which function draws which part. */

export type Part = 'explorer' | 'editor' | 'properties' | 'status' | 'title' | 'problems' | 'commit' | 'git';

const painters: Partial<Record<Part, () => void>> = {};

export function paints(by: Record<Part, () => void>): void { Object.assign(painters, by); }
export function repaint(...parts: Part[]): void { for (const part of parts) painters[part]?.(); }
/* everything that shows the hierarchy, the selection or the open document; the Git tool window is among them for the linked repositories it lists */
export function repaintAll(): void { repaint('explorer', 'editor', 'properties', 'status', 'git'); }
