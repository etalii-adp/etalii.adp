/* The memory backend: a world in this page that starts from a seed and keeps nothing. It is the backend a visit gets when it asks for none. */
import { carried } from '../common/carried';
import { InPage } from '../common/in-page';
import type { Seed } from '../common/server/seed';

export const memory = (seed: Seed): InPage => new InPage('memory', carried(seed));
