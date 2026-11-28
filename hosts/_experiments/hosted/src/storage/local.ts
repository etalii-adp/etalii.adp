/* What is kept in this browser and nowhere else, and can be read before the first paint: the visit (which page was left, which backend the visit uses, which project is open) and a person's own settings (theme, sizes, animation). Both answer at once, so the script in the head of every page can use them; everything else of the storage is asked from a backend. */

export type Theme = 'dark' | 'light';
export type SizeVar = '--fs' | '--row';
/* a person's own settings; a setting that is not there follows the system or the style sheet */
export interface Personal { theme?: Theme | null; '--fs'?: string; '--row'?: string; anim?: boolean }

/* what a visit remembers from one page to the next */
export type VisitKey = 'from' | 'transition' | 'backend' | 'service' | 'project';

const VISIT = 'adp-hosted-';
const PERSONAL = 'adp-hosted-prefs';
/* where the animation setting was kept before it joined the others */
const LEGACY_ANIM = 'adp-ide-anim';

const area = (name: 'sessionStorage' | 'localStorage'): Storage | null => { try { return globalThis[name] ?? null; } catch { return null; } };

/* the visit: kept as long as the tab is, and lost without harm where the browser keeps nothing */
export const visit = {
  get(key: VisitKey): string { try { return area('sessionStorage')?.getItem(VISIT + key) ?? ''; } catch { return ''; } },
  set(key: VisitKey, value: string): void { try { area('sessionStorage')?.setItem(VISIT + key, value); } catch { /* nothing to remember it in: the next page starts without it */ } },
};

let known: Personal | null = null;
function read(): Personal {
  const store = area('localStorage');
  let found: Personal = {};
  try { found = (JSON.parse(store?.getItem(PERSONAL) ?? 'null') as Personal | null) ?? {}; } catch { /* unreadable: the defaults stand */ }
  try { const a = store?.getItem(LEGACY_ANIM); if (found.anim === undefined && a != null) found.anim = a === '1'; } catch { /* storage is off */ }
  return found;
}

export const personal = {
  get(): Personal { return known ??= read(); },
  set(change: Personal): void {
    known = { ...personal.get(), ...change };
    try { area('localStorage')?.setItem(PERSONAL, JSON.stringify(known)); } catch { /* storage is off: the choice lasts as long as the page */ }
  },
};
