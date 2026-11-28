/* The catalogue's kinds of item: label, icon, colour, stored form, tool, and the kinds an item of the kind takes. With them, what each tool is called and the lists the tools offer a choice from. */
import type { MessageInitShape } from '@bufbuild/protobuf';
import type { KindSchema } from '../../gen/adp/storage/v1/catalogue_pb';

type KindInit = MessageInitShape<typeof KindSchema>;

/* stored says how an item is kept: a file suffix, the files of its folder, or '@' for inside its parent's file */
const kind = (name: string, label: string, icon: string, colour: string, stored?: string | string[], tool = '', takes: string[] = []): KindInit =>
  ({ name, label, icon, colour, tool, takes, storedSuffix: typeof stored === 'string' && stored !== '@' ? stored : '', storedFiles: Array.isArray(stored) ? stored : [], storedInside: stored === '@' });

export const KINDS: KindInit[] = [
  kind('solution', 'Solution', 'cube', 'blue'),
  kind('area', 'Area', 'folder', 'muted'),
  kind('group', 'Group', 'folder', 'muted'),
  kind('source', 'Data source', 'plug', 'teal', '.source.yaml', 'form'),
  kind('pipeline', 'Data pipeline', 'flow', 'green', ['pipeline.did', 'mapping.yaml', 'transform.sql'], 'flow'),
  kind('schema', 'Schema', 'braces', 'yellow', '.schema.json', 'schema'),
  kind('entity', 'Entity type', 'shapes', 'purple', '@', 'entity'),
  kind('ontology', 'Ontology model', 'graph', 'purple', ['model.did', 'shapes.ttl'], 'onto', ['entity']),
  kind('vocabulary', 'Vocabulary', 'list', 'purple', '.skos.ttl', 'code'),
  kind('model', 'AI model', 'chip', 'orange', ['model.ded', 'evaluation.yaml'], 'form'),
  kind('prompt', 'Prompt', 'chat', 'orange', '.prompt.md', 'code'),
  kind('agent', 'Agent', 'bot', 'orange', ['agent.ded', 'instructions.md', 'tools.yaml'], 'form'),
  kind('evalset', 'Evaluation set', 'beaker', 'orange', '.eval.jsonl', 'check'),
  kind('dashboard', 'Analysis view', 'chart', 'blue', ['view.ded', 'queries.sql'], 'dash'),
  kind('notebook', 'Notebook', 'notebook', 'blue', '.ipynb', 'code'),
  kind('page', 'Web page', 'window', 'teal', ['page.ded', 'page.html', 'page.css'], 'page'),
  kind('theme', 'Theme', 'palette', 'teal', '.theme.json', 'form'),
  kind('component', 'Component', 'puzzle', 'purple', ['component.ded', 'component.tsx', 'component.css'], 'form'),
  kind('csapp', 'C# console application', 'terminal', 'purple', undefined, '', ['csharp', 'group']),
  kind('csharp', 'C# file', 'filecode', 'purple', '.cs', 'code'),
  kind('pyproject', 'Python project', 'package', 'blue', undefined, '', ['python', 'group']),
  kind('python', 'Python file', 'filecode', 'blue', '.py', 'code'),
  kind('release', 'Release pipeline', 'rocket', 'red', ['pipeline.did', 'stages.yaml'], 'flow'),
  kind('environment', 'Environment', 'server', 'red', '.env.yaml', 'form'),
  kind('testsuite', 'Test suite', 'check', 'green', ['suite.yaml', 'cases.jsonl'], 'check'),
  kind('procedure', 'Validation procedure', 'clipboard', 'green', '.procedure.ded', 'check'),
  kind('doc', 'Document', 'doc', 'muted', '.md', 'doc'),
  kind('code', 'Query', 'code', 'yellow', '.sql', 'code'),
  kind('file', 'File', 'file', 'muted'),
];

/* what each tool is called */
export const WORDS: Record<string, string> = { flow: 'Diagram', onto: 'Diagram', entity: 'Designer', schema: 'Designer', form: 'Designer', check: 'Designer', dash: 'Designer', page: 'Designer', code: 'Editor', doc: 'Editor' };

/* the lists a tool offers a choice from */
export const OPTIONS: Record<string, string[]> = {
  'attribute-types': ['text', 'int', 'decimal', 'date', 'datetime', 'boolean', 'enum', 'geo', 'kV', 'A', 'kVA', 'EUR'],
  'field-types': ['string', 'int', 'decimal', 'boolean', 'date', 'datetime', 'enum', 'object', 'array'],
  'schema-formats': ['JSON', 'Avro', 'Parquet', 'CSV'],
  'schema-compatibility': ['Backward', 'Forward', 'Full', 'None'],
};

/* what a level takes when it does not say */
export const DEFAULT_ACCEPTS = ['group', 'doc'];
