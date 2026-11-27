/* Keeps the browser out of the IDE's way: its keyboard shortcuts, the back and forward buttons of a mouse and its context menu do nothing on this page, so the IDE can give each of them a meaning of its own, on Windows and on a Mac alike (Peter, 2026-11-27). Only the browser's own answer is taken away: every key and button still reaches the IDE's handlers.

A text field keeps what typing needs: the clipboard, select all, undo and redo, moving and deleting by word or line, and the characters a keyboard types with AltGr or Option.

A browser keeps a few shortcuts to itself whatever a page does: a new tab or window, closing one, switching tabs, quitting. Chromium hands over those as well while the page is in full screen or runs as an installed app (its Keyboard Lock), so the IDE asks for them there; View, Enter Full Screen and F11 put the IDE in full screen. */

const mac = /Mac|iPhone|iPad/.test(navigator.platform);

/* inputs that take no text */
const NO_TEXT = new Set(['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit']);
/* a field the user types text in */
const typesIn = (t: EventTarget | null): boolean => t instanceof HTMLElement && (t.isContentEditable || t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && !NO_TEXT.has(t.type)));

/* with Ctrl, or Command on a Mac, in a text field: moving and deleting, with or without Shift */
const MOVES = new Set(['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'backspace', 'delete', 'home', 'end']);

/* true for a key press the text field under it needs for typing or editing */
function edits(e: KeyboardEvent): boolean {
  if (!typesIn(e.target)) return false;
  if (e.getModifierState('AltGraph')) return true;
  const key = e.key.toLowerCase(), main = e.ctrlKey || e.metaKey;
  /* Option types characters and moves by word on a Mac; on Windows Alt with an arrow is the browser's history */
  if (e.altKey) return mac && !main;
  if (MOVES.has(key)) return true;
  if (key === 'z' || key === 'v') return true;
  if (e.shiftKey) return false;
  return key === 'a' || key === 'c' || key === 'x' || (key === 'y' && !mac);
}

/* true for a key press the browser would answer itself: anything with Ctrl, Command or Alt, and the function keys */
const shortcut = (e: KeyboardEvent): boolean => (e.ctrlKey || e.metaKey || e.altKey || /^F\d{1,2}$/.test(e.key)) && !edits(e);

interface KeyboardLock { lock?: (keys?: string[]) => Promise<void> }
/* asks Chromium for the keys it otherwise keeps; it gives them in full screen and in an installed app, and refuses elsewhere */
const lockKeys = (): void => { (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard?.lock?.().catch(() => { /* not in full screen: the browser keeps its few */ }); };

/* puts the IDE in full screen, or takes it out */
export function fullScreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => { /* the browser refused: the IDE stays in its window */ });
}
export const isFullScreen = (): boolean => !!document.fullscreenElement;

export function ownTheBrowser(): void {
  /* in the capture phase on the window, so no handler of the IDE has to remember it */
  addEventListener('keydown', e => {
    if (!shortcut(e)) return;
    e.preventDefault();
    if (e.key === 'F11' && !e.repeat) fullScreen();
  }, true);
  /* Alt alone moves the focus to the browser's menu when it is let go */
  addEventListener('keyup', e => { if (e.key === 'Alt' || /^F\d{1,2}$/.test(e.key)) e.preventDefault(); }, true);

  /* buttons 3 and 4 of a mouse are the browser's back and forward */
  const side = (e: MouseEvent): void => { if (e.button === 3 || e.button === 4) e.preventDefault(); };
  for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'auxclick'] as const) addEventListener(type, side, true);

  /* Ctrl or Command with the wheel zooms the browser's page */
  addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) e.preventDefault(); }, { capture: true, passive: false });

  /* the IDE shows its own menu where it has one, and none elsewhere */
  addEventListener('contextmenu', e => e.preventDefault(), true);

  lockKeys();
  document.addEventListener('fullscreenchange', lockKeys);
}
