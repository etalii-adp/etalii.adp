/* The shapes of the YAML files the example data is written in, one per file. The build reads the files into one module (gen/data.ts) that is checked against these shapes, so a field that is missing or misspelt in a file fails the build. */
import type { CheckRow, DashboardDocument, FlowDocument, SchemaField, SectionType } from '../../documents';

export type KindName =
  | 'solution' | 'area' | 'group' | 'source' | 'pipeline' | 'schema' | 'entity' | 'ontology' | 'vocabulary' | 'model' | 'prompt' | 'agent' | 'evalset'
  | 'dashboard' | 'notebook' | 'page' | 'theme' | 'component' | 'csapp' | 'csharp' | 'pyproject' | 'python' | 'release' | 'environment' | 'testsuite' | 'procedure' | 'doc' | 'code' | 'file';
/* modified, or added and not committed */
export type Change = 'modified' | 'added';
export type Severity = 'error' | 'warning' | 'info';
/* a value that is the same for every item, or one for some items, by the name they have in solution.yaml, and another for the rest */
export type Choice<T> = T | { items: Record<string, T>; otherwise: T };
/* what an item holds by its name, and what every other item of a kind holds */
interface Held<T> { items: Record<string, T>; kinds: Partial<Record<KindName, T>> }

/* workspace.yaml */
export interface ProjectData { name: string; initials: string; colour: string; path: string; branch: string; about: string; opened: string; asset: boolean }
export interface WorkspaceData {
  version: string;
  workspace: string;
  user: { name: string; email: string; initials: string };
  password: string;
  answerMs: number;
  providers: string[];
  /* the one project that opens, and what the others say */
  opens: string;
  closed: string;
  projects: ProjectData[];
  /* a repository to offer when one is linked in, the level it is offered under, and what a linked repository brings */
  suggestedLink: { repository: string; name: string; refs: string[]; under: string };
  linkedRepository: { icon: string; refs: string[]; items: { name: string; kind: KindName }[] };
  sinceFetch: string;
  environment: string;
}

/* solution.yaml */
export interface ItemData {
  name: string;
  kind: KindName;
  icon?: string;
  /* the name it has on disk where that is not made from its name */
  file?: string;
  accepts?: KindName[];
  view?: 'logical' | 'files';
  link?: { repository: string; ref: string; refs: string[] };
  /* the files its folder holds beside its items, and the ones git ignores */
  files?: string[];
  ignoredFiles?: string[];
  /* the flows between its children and the shared layout of its canvas, by the names of the children */
  flows?: { from: string; to: string }[];
  layout?: { item: string; x: number; y: number }[];
  children?: ItemData[];
}
export interface SolutionData { key: string; path: string; root: ItemData }

/* git.yaml */
export interface GitData {
  branch: string;
  upstream: string;
  ahead: number;
  behind: number;
  fetched: string;
  suggestedMessage: string;
  /* the people who commit to the project */
  people: string[];
  refs: { name: string; kind: 'local' | 'remote' | 'tag'; at: string }[];
  commits: { hash: string; lane: number; parents: string[]; message: string; author: string; when: string; days: number; touched: { item: string; state: Change }[] }[];
  changes: { item: string; files: { path: string; state: Change }[] }[];
  items: { item: string; state: Change; lastAuthor: string; lastDays: number }[];
}

/* status.yaml, workbench.yaml, agent.yaml */
export interface StatusData { problems: { severity: Severity; message: string; item: string }[]; environments: { name: string; healthy: boolean; note: string }[]; defaultRun: string }
export interface WorkbenchData { selected: string; document: string; tabs: string[]; expanded: string[] }
export interface AgentData { conversations: { title: string; day: string; time: string; messages: { author: 'user' | 'agent'; time: string; text: string; items?: string[]; steps?: string[] }[] }[] }

/* flows.yaml, checks.yaml, code.yaml */
export type FlowsData = Held<FlowDocument>;
export interface ChecksData extends Held<CheckRow[]> { lastRun: string }
export interface CodeData extends Held<string> { otherwise: string }

/* ontology.yaml */
export interface ModelData { entities: { name: string; x: number; y: number; attrs: string[]; definedIn?: string }[]; relations: { from: string; to: string; label: string }[] }
export interface OntologyData { models: Record<string, ModelData> }

/* schemas.yaml */
export interface SchemasData { items: Record<string, SchemaField[]>; otherwise: SchemaField[]; usedBy: Record<string, string[]>; settings: { format: Choice<string>; version: string; compat: string } }

/* pages.yaml */
export interface SectionData { name: string; binding: string; refresh: string; html: string; parts?: Record<string, Choice<string>> }
export interface PagesData {
  items: Record<string, SectionType[]>;
  otherwise: SectionType[];
  sections: Record<SectionType, SectionData>;
  unbound: { binding: string; sections: Record<string, SectionType[]> };
  library: { item: string; kind: KindName; more: string[]; from: string };
}

/* dashboards.yaml */
export interface DashboardsData { note: string; items: Record<string, Omit<DashboardDocument, 'note'>>; otherwise: string }

/* forms.yaml */
export type FieldData = [label: string, type: 'sel' | 'text' | 'mono' | 'num' | 'area' | 'secret' | 'ref' | 'tog' | 'chips', value: Choice<string | boolean | string[]>];
export interface FormSectionData { title: string; fields: FieldData[] }
export interface FormsData { kinds: Partial<Record<KindName, FormSectionData[]>>; otherwise: FormSectionData[] }

/* documents.yaml */
export interface DocumentsData { items: Record<string, string>; folders: Record<string, string>; otherwise: string; fresh: string }

/* files.yaml */
export interface FilesData { holds: Record<string, string>; sql: string; otherwise: string; texts: Record<string, string> }

/* every file, by its name */
export interface Data {
  workspace: WorkspaceData; solution: SolutionData; git: GitData; status: StatusData; workbench: WorkbenchData; agent: AgentData;
  flows: FlowsData; ontology: OntologyData; schemas: SchemasData; pages: PagesData; dashboards: DashboardsData; forms: FormsData; checks: ChecksData; documents: DocumentsData; code: CodeData; files: FilesData;
}
