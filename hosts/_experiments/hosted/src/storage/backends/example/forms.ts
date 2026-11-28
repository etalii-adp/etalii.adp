/* Example data: the settings each form-based designer shows, per kind of item. */
import type { Item } from '../../gen/adp/storage/v1/solution_pb';
import { slug } from '../server/project';
import type { KindName } from './draft';

/* one setting: its label, the control it gets, and its value; a reference names an item, and gets that item's id when the form is read */
export type FormField =
  | [label: string, type: 'sel' | 'text' | 'mono' | 'num' | 'area' | 'secret' | 'ref', value: string]
  | [label: string, type: 'tog', value: boolean]
  | [label: string, type: 'chips', value: string[]];
export type FormSection = [title: string, fields: FormField[]];

export const FORM:Partial<Record<KindName,(x:Item)=>FormSection[]>>={
 source:x=>[['Connection',[['Type','sel',x.name.includes('SCADA')?'Kafka stream':x.name.includes('Weather')?'REST API':'SFTP batch'],['Endpoint','mono',x.name.includes('SCADA')?'kafka://broker.atlas.example:9092/scada.events':'sftp://drop.atlas.example/'+slug(x.name)],['Schedule','text','Every 15 minutes'],['Credentials','secret','vault://atlas/ingestion/'+slug(x.name)]]],['Data',[['Format','sel','CSV'],['Schema','ref','Meter reading'],['Feeds pipeline','ref','Meter readings to Bronze'],['Owner','text','Grid data team']]]],
 model:()=>[['Model',[['Base model','sel','Gradient boosted trees'],['Target','text','System load, next 48 hours'],['Features from','ref','Asset model'],['Training data','ref','Meter readings to Bronze']]],['Quality',[['Evaluation set','ref','Forecast backtest 2025'],['Accept when MAPE below','num','3.5'],['Retrain','sel','Weekly']]],['Serving',[['Environment','ref','Staging'],['Explain predictions','tog',true],['Log inputs for audit','tog',true]]]],
 agent:()=>[['Agent',[['Model','sel','Large reasoning model'],['Instructions','area','Triage incoming outage reports. Match each report to a feeder using the Grid topology, merge duplicates, and propose a priority. Never promise a restore time.'],['Tools','chips',['Search ontology','Query Silver','Create work order','Notify crew lead']]]],['Guardrails',[['Needs approval for','chips',['Create work order']],['Evaluation set','ref','Triage golden set'],['Hand over to a person','tog',true]]]],
 environment:x=>[['Environment',[['Region','sel','West Europe'],['Tier','sel',x.name==='Production'?'High availability':'Standard'],['Replicas','num',x.name==='Production'?'6':'2'],['Address','mono','https://'+slug(x.name)+'.atlas.example.com']]],['Release',[['Deployed by','ref',x.name==='Production'?'Deploy to production':'Deploy to staging'],['Approval needed','tog',x.name==='Production'],['Secrets vault','secret','vault://atlas/'+slug(x.name)]]]],
 theme:()=>[['Colours',[['Brand','mono','#0F6E5B'],['Surface','mono','#FFFFFF'],['Text','mono','#1B2430']]],['Type',[['Heading font','sel','Source Sans 3'],['Body font','sel','Source Sans 3'],['Base size','num','16']]],['Shape',[['Corner radius','num','6'],['Density','sel','Comfortable']]]],
 component:x=>[['Component',[['Name','text',x.name],['Slots','chips',['Title','Body','Actions']],['Accepts data binding','tog',x.name!=='Header']]],['Variants',[['Sizes','chips',['Compact','Regular','Wide']],['Themes','chips',['Light','Dark']]]]]};
