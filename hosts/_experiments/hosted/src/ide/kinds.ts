/* The kinds of item a solution holds, as the catalogue gives them: label, icon, colour, stored form, tool. WORD says what each tool is called. */
import { storage } from './storage';
import type { KindInfo, KindName, ToolName } from './types';

/* a kind by its name; a kind the catalogue does not know shows as a plain file */
export const K = new Proxy({} as Record<KindName, KindInfo>, { get: (_kinds, name) => storage.catalogue.kind(String(name)) });
export const WORD = new Proxy({} as Record<ToolName, string>, { get: (_words, tool) => storage.catalogue.words[tool as ToolName] ?? '' });

/* the kinds a level takes: what it says itself, or what every level takes */
export const acceptsOf = (x: { accepts?: readonly KindName[] }): readonly KindName[] => x.accepts ?? storage.catalogue.defaultAccepts;
/* a kind's label as it reads inside a sentence: without its capital, unless it starts with a name */
export const inSentence = (k: KindName): string => { const l = K[k].label; return /^(AI|C#|Python) /.test(l) ? l : l[0].toLowerCase() + l.slice(1); };
