/* The theme, font size and density chosen in the IDE's settings. They are a person's own settings, kept across the pages by the storage (storage/local.ts). */
import { personal, type SizeVar, type Theme } from '../storage/local';

const sizeVars: readonly SizeVar[] = ['--fs', '--row'];

export function applyPrefs(): void {
  const r = document.documentElement, prefs = personal.get();
  if (prefs.theme) r.dataset.theme = prefs.theme; else delete r.dataset.theme;
  for (const k of sizeVars) { const v = prefs[k]; if (v) r.style.setProperty(k, v); else r.style.removeProperty(k); }
}
/* null follows the system */
export function setTheme(theme: Theme | null): void { personal.set({ theme }); applyPrefs(); }
export function setVar(name: SizeVar, value: string): void { personal.set({ [name]: value }); applyPrefs(); }
