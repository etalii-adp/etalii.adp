/* The empty backend: a world in this page that starts from a seed with nothing in it, and keeps nothing. */
import { carried } from '../common/carried';
import { InPage } from '../common/in-page';
import { empty } from './seed';

export const emptyBackend = (): InPage => new InPage('empty', carried(empty));
