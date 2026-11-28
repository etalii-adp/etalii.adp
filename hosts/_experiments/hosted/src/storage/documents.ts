/* What the text of an item's stored form reads as, per tool. A backend writes these and a tool reads them; in this concept every one of them is JSON, except the text an editor shows as it is. */

/* Diagram of a pipeline: steps on a grid, and the arrows between them by index */
export type StepType = 'Source' | 'Validate' | 'Transform' | 'Map' | 'Sink' | 'Stage' | 'Gate' | 'Deploy' | 'Test';
/* a step that is new and not committed, or one with an error */
export type StepFlag = 'new' | 'err';
export interface FlowDocument {
  nodes: { n: string; t: StepType; x: number; y: number; f?: StepFlag }[];
  edges: [from: number, to: number][];
}

/* Diagram of an ontology model: what each of its entity types holds, by the id of the entity type's item, and the relations between them */
export interface EntityContent {
  /* attributes as "name: type", and which of them are required */
  attrs: string[];
  req?: boolean[];
  /* its place in the diagram */
  x?: number;
  y?: number;
  /* the model it is defined in, when it is a reference */
  ext?: string;
}
export interface OntologyDocument {
  entities: Record<string, EntityContent>;
  relations: [fromId: string, toId: string, label: string][];
}

/* Designer of a data schema */
export type SchemaField = [name: string, type: string, required: boolean, constraint: string, mapsTo: string];
export interface SchemaSettings { format: string; version: string; compat: string }
export interface SchemaDocument {
  fields: SchemaField[];
  settings: SchemaSettings;
  /* the ids of the items that use it; worked out by the backend, not written */
  usedBy?: string[];
}

/* Designer of a portal page: its sections as they will look */
export type SectionType = 'nav' | 'hero' | 'cards' | 'map' | 'chart' | 'form' | 'table' | 'footer' | 'title' | 'drop';
export interface PageSection {
  type: SectionType;
  /* what the section is called */
  name: string;
  html: string;
  /* what its data comes from, and how often; unbound marks a section that needs a binding and has none */
  binding: string;
  refresh: string;
  unbound?: boolean;
}
export interface PageDocument {
  sections: PageSection[];
  /* the components the toolbox offers, and where they come from */
  components: string[];
  from: string;
}

/* Designer of an analysis view */
export interface DashboardDocument {
  /* where it reads from and how fresh it is */
  note: string;
  /* the three figures at the top: label, value, note */
  k: [label: string, value: string, note: string][];
  /* the line chart: title, unit, the name of the second line, and the level and swing of the curve */
  lt: string;
  lu: string;
  l2: string;
  base: number;
  amp: number;
  /* the bar chart: title and bars */
  bt: string;
  bars: [label: string, value: number][];
}

/* Designer of form-based settings. One setting is its label, the control it gets and its value; a reference names an item and carries its id. */
export type FormField =
  | [label: string, type: 'sel' | 'text' | 'mono' | 'num' | 'area' | 'secret', value: string]
  | [label: string, type: 'ref', value: string, itemId: string]
  | [label: string, type: 'tog', value: boolean]
  | [label: string, type: 'chips', value: string[]];
export type FormSection = [title: string, fields: FormField[]];
export interface FormDocument { sections: FormSection[] }

/* Designer of a test suite, an evaluation set or a validation procedure */
export type CheckRow = [what: string, result: 'Passed' | 'Failed' | 'Not run', owner: string];
export interface CheckDocument {
  rows: CheckRow[];
  /* when and where it last ran, in a few words */
  lastRun: string;
}

/* Editor of documentation: Markdown, here already as the rich text it shows as */
export interface TextDocument { html: string }
