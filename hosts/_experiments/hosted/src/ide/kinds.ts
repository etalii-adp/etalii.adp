/* The kinds of item a solution holds: label, icon, colour, stored form, tool. WORD says what each tool is called. */
import type { KindInfo, KindName, ToolName } from './types';

const kind = (label: string, icon: string, colour: string, stored?: string | string[], tool?: ToolName): KindInfo => ({ label, icon, colour, stored, tool });

export const K: Record<KindName, KindInfo> = {
  solution: kind('Solution', 'cube', 'blue'),
  area: kind('Area', 'folder', 'muted'),
  group: kind('Group', 'folder', 'muted'),
  source: kind('Data source', 'plug', 'teal', '.source.yaml', 'form'),
  pipeline: kind('Data pipeline', 'flow', 'green', ['pipeline.did', 'mapping.yaml', 'transform.sql'], 'flow'),
  schema: kind('Schema', 'braces', 'yellow', '.schema.json', 'schema'),
  entity: kind('Entity type', 'shapes', 'purple', '@', 'entity'),
  ontology: kind('Ontology model', 'graph', 'purple', ['model.did', 'shapes.ttl'], 'onto'),
  vocabulary: kind('Vocabulary', 'list', 'purple', '.skos.ttl', 'code'),
  model: kind('AI model', 'chip', 'orange', ['model.ded', 'evaluation.yaml'], 'form'),
  prompt: kind('Prompt', 'chat', 'orange', '.prompt.md', 'code'),
  agent: kind('Agent', 'bot', 'orange', ['agent.ded', 'instructions.md', 'tools.yaml'], 'form'),
  evalset: kind('Evaluation set', 'beaker', 'orange', '.eval.jsonl', 'check'),
  dashboard: kind('Analysis view', 'chart', 'blue', ['view.ded', 'queries.sql'], 'dash'),
  notebook: kind('Notebook', 'notebook', 'blue', '.ipynb', 'code'),
  page: kind('Web page', 'window', 'teal', ['page.ded', 'page.html', 'page.css'], 'page'),
  theme: kind('Theme', 'palette', 'teal', '.theme.json', 'form'),
  component: kind('Component', 'puzzle', 'purple', ['component.ded', 'component.tsx', 'component.css'], 'form'),
  release: kind('Release pipeline', 'rocket', 'red', ['pipeline.did', 'stages.yaml'], 'flow'),
  environment: kind('Environment', 'server', 'red', '.env.yaml', 'form'),
  testsuite: kind('Test suite', 'check', 'green', ['suite.yaml', 'cases.jsonl'], 'check'),
  procedure: kind('Validation procedure', 'clipboard', 'green', '.procedure.ded', 'check'),
  doc: kind('Document', 'doc', 'muted', '.md', 'doc'),
  code: kind('Query', 'code', 'yellow', '.sql', 'code'),
  file: kind('File', 'file', 'muted'),
};

export const WORD: Record<ToolName, 'Diagram' | 'Designer' | 'Editor'> = {
  flow: 'Diagram', onto: 'Diagram', entity: 'Designer', schema: 'Designer', form: 'Designer', check: 'Designer', dash: 'Designer', page: 'Designer', code: 'Editor', doc: 'Editor',
};
