/* Example data: the Atlas Platform solution, one hierarchy from the project root down. */
import type { Draft, KindName, Vcs } from '../types';

type Extras = Omit<Draft, 'name' | 'kind' | 'children'>;

/* an item: n(name, kind), n(name, kind, extras), n(name, kind, children) or n(name, kind, children, extras) */
export const n=(name:string,kind:KindName,a?:Draft[]|Extras,b?:Extras):Draft=>{const ch=Array.isArray(a)?a:undefined,o=(ch?b:a as Extras|undefined)??{};return{name,kind,...(ch?{children:ch}:{}),...o}};
/* a group of items of one kind, by their names; a name with a letter is modified (M) or added (A) */
const g=(name:string,kind:KindName,names:(string|[string,Vcs])[],o?:Extras):Draft=>n(name,'group',names.map(x=>Array.isArray(x)?n(x[0],kind,{vcs:x[1]}):n(x,kind)),{accepts:[kind,'group'],...o});
export const solution:Draft=n('Atlas Platform','solution',[
 n('Ingestion','area',[
  g('Sources','source',[['Smart meter readings','M'],'SCADA telemetry','Weather feed','CRM export'],{mode:'files'}),
  g('Pipelines','pipeline',[['Meter readings to Bronze','M'],'Telemetry stream','Weather enrichment','Customer sync'])],{icon:'inbox',accepts:['group','pipeline','source'],flows:[[0,1]]}),
 n('Schemas','area',[
  g('Source schemas','schema',['Meter reading','Telemetry event','Weather observation','Customer record']),
  g('Table schemas','schema',['Bronze meter readings','Silver meter readings','Silver telemetry']),
  g('API schemas','schema',['Outage report','Usage summary'])],{icon:'braces',accepts:['group','schema'],flows:[[0,1],[1,2]]}),
 n('Ontology','area',[n('Asset model','ontology',{vcs:'M'}),n('Customer model','ontology'),n('Grid topology','ontology'),
  g('Vocabularies','vocabulary',['Asset types','Outage causes',['Tariff classes','A']])],{icon:'graph',accepts:['ontology','group']}),
 n('AI','area',[g('Models','model',['Load forecast','Anomaly detection']),g('Agents','agent',['Outage triage agent','Data steward assistant']),
  g('Prompts','prompt',['Summarize outage','Explain bill']),g('Evaluation sets','evalset',['Forecast backtest 2025','Triage golden set'])],{icon:'sparkle',accepts:['group'],flows:[[2,1],[0,1],[3,0]]}),
 n('Data analysis','area',[g('Views','dashboard',['Load forecast overview','Outage heatmap','Data quality monitor']),
  g('Queries','code',['Peak load by feeder','Meters without readings']),g('Notebooks','notebook',['Forecast error analysis'])],{icon:'chart',accepts:['group']}),
 n('Portal','area',[g('Pages','page',['Home',['Outage map','A'],'My usage','Report an outage','Admin console']),n('Portal theme','theme')],{icon:'globe',accepts:['group','theme']}),
 n('Components','area',[
  n('Design system','group',[n('Header','component'),n('Card grid','component'),n('Map','component'),n('Chart','component'),n('Form','component'),n('Theme tokens','theme')],{icon:'puzzle',link:{repo:'git@git.example.com:shared/design-system.git',ref:'v3.2.0',refs:['v3.2.0','v3.1.4','main','next']}}),
  n('Identity and access','group',[n('Sign-in page','page'),n('Roles and permissions','ontology'),n('Access review','procedure')],{icon:'lock',link:{repo:'git@git.example.com:shared/identity-access.git',ref:'release/2.x',refs:['v2.4.1','v2.4.0','release/2.x','main']}}),
  n('Audit logging','group',[n('Audit event','schema'),n('Audit trail pipeline','pipeline'),n('Audit viewer','dashboard')],{icon:'clipboard',link:{repo:'git@git.example.com:shared/audit-logging.git',ref:'v1.8.2',refs:['v1.9.0','v1.8.2','main']}})],{icon:'puzzle',accepts:['group','component']}),
 n('Delivery','area',[g('Release pipelines','release',['Build and verify','Deploy to staging','Deploy to production']),g('Environments','environment',['Development','Staging','Production'])],{icon:'rocket',accepts:['group'],flows:[[0,1]]}),
 n('Quality','area',[g('Test suites','testsuite',['Pipeline regression','Portal end-to-end','Agent behaviour']),
  g('Validation procedures','procedure',['Data quality rules',['Ontology conformance','A'],'Load test','Release readiness'])],{icon:'shield',accepts:['group']}),
 n('Documentation','area',[n('Architecture overview','doc'),n('Onboarding guide','doc'),g('Runbooks','doc',['Pipeline failure','Portal outage']),g('Decisions','doc',['001 Ontology first','002 Linked repositories for reuse'])],{icon:'book',accepts:['doc','group']})
],{accepts:['group'],flows:[[1,0],[0,2],[2,3],[2,4],[3,4],[4,5],[6,5],[8,7]],
   layout0:[[0,95],[0,-75],[255,20],[510,-75],[510,110],[765,110],[510,300],[255,275],[0,275],[765,-75]]});
