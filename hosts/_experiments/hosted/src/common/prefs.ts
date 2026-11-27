/* The theme, font size and density chosen in the IDE's settings, kept across the pages in the browser's local storage. */

export type Theme = 'dark' | 'light';
export type SizeVar = '--fs' | '--row';
interface Prefs { theme?: Theme | null; '--fs'?: string; '--row'?: string }

const KEY = 'adp-hosted-prefs';
const sizeVars: readonly SizeVar[] = ['--fs', '--row'];

const prefs: Prefs = (() => { try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') || {}; } catch { return {}; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* storage is off: the choice lasts as long as the page */ } };

export function applyPrefs(): void {
  const r = document.documentElement;
  if (prefs.theme) r.dataset.theme = prefs.theme; else delete r.dataset.theme;
  for (const k of sizeVars) { const v = prefs[k]; if (v) r.style.setProperty(k, v); else r.style.removeProperty(k); }
}
/* null follows the system */
export function setTheme(theme: Theme | null): void { prefs.theme = theme; save(); applyPrefs(); }
export function setVar(name: SizeVar, value: string): void { prefs[name] = value; save(); applyPrefs(); }
