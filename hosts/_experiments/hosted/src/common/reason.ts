/* Why something was not done, in the words to show: what the storage refused it with, or that it did not answer. Anything else is a fault of the page and is thrown on. */
import { Refused, Unreachable } from '../storage';

export const reason = (e: unknown): string => { if (e instanceof Refused || e instanceof Unreachable) return e.message; throw e; };
