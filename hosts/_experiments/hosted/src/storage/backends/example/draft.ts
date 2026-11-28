/* The shapes the example data is written in, before it becomes the messages of the contract. */

export type KindName =
  | 'solution' | 'area' | 'group' | 'source' | 'pipeline' | 'schema' | 'entity' | 'ontology' | 'vocabulary' | 'model' | 'prompt' | 'agent' | 'evalset'
  | 'dashboard' | 'notebook' | 'page' | 'theme' | 'component' | 'csapp' | 'csharp' | 'pyproject' | 'python' | 'release' | 'environment' | 'testsuite' | 'procedure' | 'doc' | 'code' | 'file';
/* modified, or added and not committed */
export type Vcs = 'M' | 'A';
export type Severity = 'error' | 'warning' | 'info';

/* what an item starts as, before it has an id and a parent */
export interface Draft {
  name: string;
  kind: KindName;
  children?: Draft[];
  icon?: string;
  vcs?: Vcs;
  accepts?: KindName[];
  /* a level that shows as files */
  mode?: 'logical' | 'files';
  link?: { repo: string; ref: string; refs: string[] };
  /* the flows between its children by their index, and the shared layout of its canvas */
  flows?: [from: number, to: number][];
  layout0?: [x: number, y: number][];
  /* the name it has on disk where that is not made from its name, the files its folder holds beside its items, and the ones git ignores */
  file?: string;
  files?: string[];
  ignoredFiles?: string[];
}
