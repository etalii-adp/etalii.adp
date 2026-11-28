/* What the New Project wizard asks and what it makes of the answers: the sizes a solution comes in, the questions on technology and delivery, and the recipes. A recipe is a set of elements that belong together; the recipes a person keeps become the hierarchy of the new project, where they are composed further. */
import type { MessageInitShape } from '@bufbuild/protobuf';
import type { RecipeAreaSchema, RecipeElementSchema, RecipeSchema, SolutionSizeSchema, WizardQuestionSchema } from '../../../gen/adp/storage/v1/catalogue_pb';

type Size = MessageInitShape<typeof SolutionSizeSchema>;
type Question = MessageInitShape<typeof WizardQuestionSchema>;
type Recipe = MessageInitShape<typeof RecipeSchema>;
type Element = MessageInitShape<typeof RecipeElementSchema>;
type Area = MessageInitShape<typeof RecipeAreaSchema>;

/* changes when anything in this file does */
export const WIZARD_VERSION = '2026.3-1';

/* from small to large */
export const SIZES: Size[] = [
  { id: 'console', label: 'Console application', icon: 'terminal', scale: 1, about: 'A command-line tool or a job that runs and ends.', parts: ['One application', 'Its commands'], suggests: ['csharp', 'tests', 'docs'] },
  { id: 'web', label: 'Web application', icon: 'window', scale: 2, about: 'A site or a web app: its pages, the service behind them, and its data.', parts: ['A web client', 'One service', 'A database'], suggests: ['typescript', 'react', 'postgres', 'paas', 'tests', 'cicd', 'docs'] },
  { id: 'mobile', label: 'Mobile app', icon: 'phone', scale: 3, about: 'An app for phones and tablets, and the service it talks to.', parts: ['A mobile app', 'One service', 'A database'], suggests: ['typescript', 'reactnative', 'postgres', 'paas', 'tests', 'cicd'] },
  { id: 'service', label: 'Backend service', icon: 'server', scale: 4, about: 'An API or a worker without a user interface of its own.', parts: ['One service', 'Its API', 'A database'], suggests: ['csharp', 'postgres', 'kubernetes', 'tests', 'cicd', 'docs'] },
  { id: 'distributed', label: 'Distributed system', icon: 'org', scale: 5, about: 'Several services that talk through APIs and messages, each released by itself.', parts: ['A gateway', 'Services and workers', 'Messaging', 'Environments'], suggests: ['csharp', 'typescript', 'react', 'postgres', 'redis', 'kafka', 'kubernetes', 'tests', 'cicd', 'environments', 'docs'] },
  { id: 'platform', label: 'Platform solution', icon: 'cloud', scale: 6, about: 'A whole solution on a platform as a service: data, AI, portals and delivery in one hierarchy.', parts: ['Data and a domain model', 'AI', 'Portals and apps', 'Managed services', 'Delivery'], suggests: ['csharp', 'python', 'typescript', 'react', 'postgres', 'lakehouse', 'kafka', 'paas', 'llm', 'ml', 'tests', 'cicd', 'environments', 'docs', 'validation'] },
];

const all: string[] = [];
const options = (...rows: [id: string, label: string, about: string][]): Question['options'] => rows.map(([id, label, about]) => ({ id, label, about }));

const LANGUAGES = options(
  ['csharp', 'C# on .NET', 'Applications and services on .NET'],
  ['typescript', 'TypeScript on Node.js', 'Services and tools in TypeScript'],
  ['python', 'Python', 'Services, tools and data work in Python'],
  ['java', 'Java or Kotlin', 'Services on the JVM'],
  ['go', 'Go', 'Small services and tools'],
  ['rust', 'Rust', 'Services and tools where speed counts'],
);
const WEB = options(
  ['react', 'React', 'Components in TypeScript'],
  ['angular', 'Angular', 'A full framework in TypeScript'],
  ['vue', 'Vue', 'Components with templates'],
  ['blazor', 'Blazor', 'Components in C#'],
  ['served', 'Server-rendered pages', 'Pages the service renders itself'],
);
const MOBILE = options(
  ['reactnative', 'React Native', 'One app for iOS and Android, in TypeScript'],
  ['flutter', 'Flutter', 'One app for iOS and Android, in Dart'],
  ['maui', '.NET MAUI', 'One app for iOS and Android, in C#'],
  ['swift', 'Swift', 'An app for iOS'],
  ['kotlin', 'Kotlin', 'An app for Android'],
);
const DATA = options(
  ['postgres', 'PostgreSQL', 'A relational database'],
  ['sqlserver', 'SQL Server', 'A relational database'],
  ['mongodb', 'MongoDB', 'A document database'],
  ['redis', 'Redis', 'A cache and a key-value store'],
  ['blob', 'Object storage', 'Files and large objects'],
  ['lakehouse', 'Data lakehouse', 'Sources, pipelines and tables for analysis'],
);
const MESSAGING = options(
  ['kafka', 'Apache Kafka', 'Streams of events'],
  ['rabbitmq', 'RabbitMQ', 'Queues and routing'],
  ['bus', 'Cloud message bus', 'Queues and topics as a managed service'],
);
const HOSTING = options(
  ['paas', 'Platform as a service', 'Managed hosting, databases and secrets'],
  ['kubernetes', 'Kubernetes', 'Containers on a cluster'],
  ['serverless', 'Serverless functions', 'Functions that run on demand'],
  ['servers', 'Own servers', 'Servers you run yourself'],
);
const AI = options(
  ['llm', 'Language models and agents', 'Agents, prompts and their evaluation'],
  ['ml', 'Machine learning models', 'Models that are trained and evaluated'],
);
const DELIVERY = options(
  ['tests', 'Automated tests', 'Suites of tests that run with every change'],
  ['cicd', 'Release pipeline', 'Building, verifying and deploying'],
  ['environments', 'Environments', 'Development, staging and production'],
  ['docs', 'Documentation', 'Architecture, getting started and decisions'],
  ['validation', 'Sign-off procedures', 'Checks a person carries out and signs off'],
);

export const QUESTIONS: Question[] = [
  { id: 'language', step: 'technology', title: 'Languages and runtimes', about: 'What the code is written in.', options: LANGUAGES, sizes: all },
  { id: 'web', step: 'technology', title: 'Web front end', about: 'What the pages are built with.', options: WEB, sizes: ['web', 'distributed', 'platform'] },
  { id: 'mobile', step: 'technology', title: 'Mobile', about: 'What the app is built with.', options: MOBILE, sizes: ['mobile', 'platform'] },
  { id: 'data', step: 'technology', title: 'Data', about: 'Where the solution keeps what it knows.', options: DATA, sizes: ['web', 'mobile', 'service', 'distributed', 'platform'] },
  { id: 'messaging', step: 'technology', title: 'Messaging', about: 'How its parts tell each other what happened.', options: MESSAGING, sizes: ['service', 'distributed', 'platform'] },
  { id: 'hosting', step: 'technology', title: 'Hosting', about: 'Where it runs.', options: HOSTING, sizes: ['web', 'mobile', 'service', 'distributed', 'platform'] },
  { id: 'ai', step: 'technology', title: 'AI', about: 'What it uses models for.', options: AI, sizes: all },
  { id: 'delivery', step: 'delivery', title: 'Delivery and quality', about: 'What the project needs beside its code.', options: DELIVERY, sizes: all },
];

/* the areas a new project gets, in the order it shows them; an area is only made when a recipe puts something in it */
export const AREAS: Area[] = [
  { name: 'Applications', icon: 'monitor', accepts: ['csapp', 'pyproject', 'srcproject', 'group'] },
  { name: 'Services', icon: 'server', accepts: ['service', 'group'] },
  { name: 'Web', icon: 'globe', accepts: ['webapp', 'group'] },
  { name: 'Mobile', icon: 'phone', accepts: ['mobileapp', 'group'] },
  { name: 'Data', icon: 'database', accepts: ['datastore', 'ontology', 'group'] },
  { name: 'Messaging', icon: 'queue', accepts: ['channel', 'group'] },
  { name: 'AI', icon: 'sparkle', accepts: ['group'] },
  { name: 'Analysis', icon: 'chart', accepts: ['group'] },
  { name: 'Platform', icon: 'cloud', accepts: ['platformservice', 'group'] },
  { name: 'Delivery', icon: 'rocket', accepts: ['group'] },
  { name: 'Quality', icon: 'shield', accepts: ['group'] },
  { name: 'Documentation', icon: 'book', accepts: ['doc', 'group'] },
];

/* elements */
const item = (name: string, kind: string, file = ''): Element => ({ name, kind, file });
/* a group of items of some kinds, which takes more of them */
const group = (name: string, kinds: string[], children: Element[] = []): Element => ({ name, kind: 'group', accepts: [...kinds, 'group'], children });
const level = (name: string, kind: string, accepts: string[], children: Element[]): Element => ({ name, kind, accepts, children });

/* how a language names its projects and its files */
interface Language { short: string; console: string; project: string; file: string; main: string; named: (words: string) => string }
const pascal = (words: string): string => words.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join('');
const snake = (words: string): string => words.toLowerCase().replace(/ /g, '_');
const LANGUAGE: Record<string, Language> = {
  csharp: { short: 'C#', console: 'csapp', project: 'srcproject', file: 'csharp', main: 'Program.cs', named: w => pascal(w) + '.cs' },
  typescript: { short: 'TypeScript', console: 'srcproject', project: 'srcproject', file: 'srcfile', main: 'main.ts', named: w => w.toLowerCase().replace(/ /g, '-') + '.ts' },
  python: { short: 'Python', console: 'pyproject', project: 'pyproject', file: 'python', main: '__main__.py', named: w => snake(w) + '.py' },
  java: { short: 'Java', console: 'srcproject', project: 'srcproject', file: 'srcfile', main: 'Main.java', named: w => pascal(w) + '.java' },
  go: { short: 'Go', console: 'srcproject', project: 'srcproject', file: 'srcfile', main: 'main.go', named: w => snake(w) + '.go' },
  rust: { short: 'Rust', console: 'srcproject', project: 'srcproject', file: 'srcfile', main: 'main.rs', named: w => snake(w) + '.rs' },
};
const source = (l: Language, name: string, file = l.named(name)): Element => item(name, l.file, file);
const sources = (l: Language, name: string, files: string[] = []): Element => group(name, [l.file], files.map(f => source(l, f)));
const code = (l: Language, name: string, kind: string, children: Element[]): Element => level(name, kind, [l.file, 'group'], children);

const label = (list: Question['options'], id: string): string => list!.find(o => o.id === id)!.label!;
const BACKED = ['web', 'mobile', 'service', 'distributed', 'platform'], LARGE = ['distributed', 'platform'];

const perLanguage: Recipe[] = Object.entries(LANGUAGE).flatMap(([id, l]): Recipe[] => [
  {
    id: 'console-' + id, name: `${l.short} console application`, area: 'Applications', sizes: ['console'], needs: [id],
    about: 'One application that runs from the command line, with its commands apart from where it starts.',
    elements: [code(l, 'Console application', l.console, [source(l, 'Main', l.main), sources(l, 'Commands', ['Command', 'Help command']), sources(l, 'Tests', ['Command tests'])])],
  },
  {
    id: 'service-' + id, name: `${l.short} service with an API`, area: 'Services', sizes: BACKED, needs: [id],
    about: 'A service: where it starts, its endpoints, what it knows of its domain, and the contracts of its API.',
    elements: [level(`${l.short} service`, 'service', ['group', l.project, 'schema'], [
      code(l, 'Host', l.project, [source(l, 'Main', l.main), sources(l, 'Endpoints', ['Health endpoint']), sources(l, 'Domain'), sources(l, 'Tests', ['Endpoint tests'])]),
      group('Contracts', ['schema'], [item('Request', 'schema'), item('Response', 'schema')]),
    ])],
  },
  {
    id: 'worker-' + id, name: `${l.short} worker`, area: 'Services', sizes: LARGE, needs: [id],
    about: 'A service without an API of its own: it takes messages and jobs and handles them.',
    elements: [level(`${l.short} worker`, 'service', ['group', l.project, 'schema'], [code(l, 'Host', l.project, [source(l, 'Main', l.main), sources(l, 'Handlers', ['Message handler'])])])],
  },
]);

const client = (pages: string): Element[] => [group(pages, ['page'], [item('Home', 'page'), item('Sign in', 'page'), item('Settings', 'page')]), group('Components', ['component'], [item('Header', 'component'), item('Footer', 'component')]), item('Theme', 'theme')];
const perClient: Recipe[] = [
  ...WEB!.map((o): Recipe => ({ id: 'web-' + o.id, name: `${o.label} web client`, area: 'Web', sizes: ['web', 'distributed', 'platform'], needs: [o.id!], about: 'A web client: its pages, the components they are made of, and its theme.', elements: [level(`${o.label} client`, 'webapp', ['group', 'page', 'component', 'theme'], client('Pages'))] })),
  ...MOBILE!.map((o): Recipe => ({ id: 'mobile-' + o.id, name: `${o.label} app`, area: 'Mobile', sizes: ['mobile', 'platform'], needs: [o.id!], about: 'A mobile app: its screens, the components they are made of, and its theme.', elements: [level(`${o.label} app`, 'mobileapp', ['group', 'page', 'component', 'theme'], client('Screens'))] })),
];

const perStore: Recipe[] = [
  ...['postgres', 'sqlserver', 'mongodb'].map((id): Recipe => ({ id: 'data-' + id, name: `${label(DATA, id)} database`, area: 'Data', sizes: BACKED, needs: [id], about: 'A database, and the schemas of what it holds.', elements: [item(`${label(DATA, id)} database`, 'datastore'), group(id === 'mongodb' ? 'Collections' : 'Tables', ['schema'])] })),
  { id: 'data-redis', name: 'Redis cache', area: 'Data', sizes: BACKED, needs: ['redis'], about: 'A cache in front of what is slow to ask for.', elements: [item('Redis cache', 'datastore')] },
  { id: 'data-blob', name: 'Object storage', area: 'Data', sizes: BACKED, needs: ['blob'], about: 'A place for files and large objects.', elements: [item('Object storage', 'datastore')] },
  { id: 'data-lakehouse', name: 'Data lakehouse', area: 'Data', sizes: BACKED, needs: ['lakehouse'], about: 'Data that comes in from sources, through pipelines, into tables for analysis.', elements: [group('Sources', ['source']), group('Pipelines', ['pipeline'], [item('First ingestion', 'pipeline')]), group('Tables', ['schema'])] },
  { id: 'data-model', name: 'Domain model', area: 'Data', sizes: LARGE, needs: [], about: 'An ontology of what the solution is about, which its data, pages and models refer to.', elements: [item('Domain model', 'ontology'), group('Vocabularies', ['vocabulary'])] },
  { id: 'analysis', name: 'Analysis views', area: 'Analysis', sizes: ['platform'], needs: ['lakehouse'], about: 'Views, queries and notebooks on the data of the lakehouse.', elements: [group('Views', ['dashboard'], [item('Overview', 'dashboard')]), group('Queries', ['code']), group('Notebooks', ['notebook'])] },
];

const perBroker: Recipe[] = MESSAGING!.map((o): Recipe => ({ id: 'messaging-' + o.id, name: `${o.label} messaging`, area: 'Messaging', sizes: ['service', 'distributed', 'platform'], needs: [o.id!], about: 'The channels the parts of the solution talk through, and the schemas of their messages.', elements: [group('Channels', ['channel'], [item(`${o.label} events`, 'channel')]), group('Messages', ['schema'], [item('Event envelope', 'schema')])] }));

const service = (...names: string[]): Element[] => names.map(n => item(n, 'platformservice'));
const managed: [id: string, name: string][] = [['postgres', 'Managed PostgreSQL'], ['sqlserver', 'Managed SQL Server'], ['mongodb', 'Managed MongoDB'], ['redis', 'Managed Redis'], ['blob', 'Storage account'], ['kafka', 'Managed Kafka'], ['rabbitmq', 'Managed RabbitMQ'], ['bus', 'Message bus namespace']];
/* the sizes that are asked about an option, among some: a recipe is not offered where what it needs cannot be chosen */
const askedOf = (optionId: string, among: string[]): string[] => { const q = QUESTIONS.find(x => x.options!.some(o => o.id === optionId))!; return among.filter(size => !q.sizes?.length || q.sizes.includes(size)); };
const perHost: Recipe[] = [
  { id: 'host-paas', name: 'Platform as a service', area: 'Platform', sizes: BACKED, needs: ['paas'], about: 'The managed services the solution runs on.', elements: service('Application hosting', 'Secrets vault', 'Monitoring') },
  ...managed.map(([id, name]): Recipe => ({ id: 'host-paas-' + id, name, area: 'Platform', sizes: askedOf(id, BACKED), needs: ['paas', id], about: 'The platform runs it for you: sizing, backups and updates are settings.', elements: service(name) })),
  { id: 'host-kubernetes', name: 'Kubernetes cluster', area: 'Platform', sizes: BACKED, needs: ['kubernetes'], about: 'A cluster, the registry its images come from, and the way in.', elements: service('Container cluster', 'Container registry', 'Ingress') },
  { id: 'host-serverless', name: 'Serverless functions', area: 'Platform', sizes: BACKED, needs: ['serverless'], about: 'Functions that run on demand, behind one front door.', elements: service('Function app', 'API management') },
  { id: 'host-servers', name: 'Own servers', area: 'Platform', sizes: BACKED, needs: ['servers'], about: 'The servers the solution runs on, and what is in front of them.', elements: service('Application server', 'Reverse proxy') },
  { id: 'host-identity', name: 'Identity provider', area: 'Platform', sizes: ['web', 'mobile', 'distributed', 'platform'], needs: [], about: 'Who signs in, and what they may do.', elements: service('Identity provider') },
  { id: 'gateway', name: 'API gateway', area: 'Services', sizes: LARGE, needs: [], about: 'The one way in from outside, with the routes to the services behind it.', elements: [level('API gateway', 'service', ['group', 'schema'], [group('Routes', ['schema'], [item('Public API', 'schema')])])] },
];

const other: Recipe[] = [
  { id: 'ai-llm', name: 'Language models and agents', area: 'AI', sizes: all, needs: ['llm'], about: 'Agents, the prompts they work from, and the sets they are evaluated with.', elements: [group('Agents', ['agent'], [item('Assistant', 'agent')]), group('Prompts', ['prompt'], [item('System prompt', 'prompt')]), group('Evaluations', ['evalset'], [item('Golden set', 'evalset')])] },
  { id: 'ai-ml', name: 'Machine learning models', area: 'AI', sizes: all, needs: ['ml'], about: 'Models, what they are evaluated with, and notebooks to explore in.', elements: [group('Models', ['model'], [item('First model', 'model')]), group('Evaluations', ['evalset'], [item('Backtest', 'evalset')]), group('Notebooks', ['notebook'], [item('Exploration', 'notebook')])] },
  { id: 'delivery-cicd', name: 'Release pipeline', area: 'Delivery', sizes: all, needs: ['cicd'], about: 'A pipeline that builds and verifies every change, and one that deploys.', elements: [group('Pipelines', ['release'], [item('Build', 'release'), item('Deploy', 'release')])] },
  { id: 'delivery-environments', name: 'Environments', area: 'Delivery', sizes: all, needs: ['environments'], about: 'Where the solution runs before and after it is released.', elements: [group('Environments', ['environment'], [item('Development', 'environment'), item('Staging', 'environment'), item('Production', 'environment')])] },
  { id: 'quality-tests', name: 'Automated tests', area: 'Quality', sizes: all, needs: ['tests'], about: 'Suites of tests that run with every change.', elements: [group('Tests', ['testsuite'], [item('Unit tests', 'testsuite'), item('Integration tests', 'testsuite')])] },
  { id: 'quality-e2e', name: 'End-to-end tests', area: 'Quality', sizes: ['web', 'mobile', 'distributed', 'platform'], needs: ['tests'], about: 'Tests that use the solution as a person does.', elements: [group('Tests', ['testsuite'], [item('End-to-end tests', 'testsuite')])] },
  { id: 'quality-validation', name: 'Sign-off procedures', area: 'Quality', sizes: all, needs: ['validation'], about: 'Checks a person carries out and signs off before a release.', elements: [group('Procedures', ['procedure'], [item('Release checklist', 'procedure')])] },
  { id: 'docs', name: 'Documentation', area: 'Documentation', sizes: all, needs: ['docs'], about: 'What a newcomer reads first, and why things are as they are.', elements: [item('Architecture', 'doc'), item('Getting started', 'doc'), group('Decisions', ['doc'])] },
  { id: 'docs-runbooks', name: 'Runbooks', area: 'Documentation', sizes: LARGE, needs: ['docs'], about: 'What to do when something fails in production.', elements: [group('Runbooks', ['doc'])] },
];

export const RECIPES: Recipe[] = [...perLanguage, ...perClient, ...perStore, ...perBroker, ...perHost, ...other];
