/* Example data: test suites and validation procedures. */
import type { CheckRow } from '../../documents';
import type { KindName } from './draft';

/* by the name of the item, and for the others by their kind */
export const CHECK:Record<string,CheckRow[]>={
 'Data quality rules':[['Readings arrive within 15 minutes','Passed','Grid data team'],['No duplicate meter and timestamp pairs','Passed','Grid data team'],['Reading value within physical range','Failed',''],['Every meter resolves to a service point','Passed',''],['Tariff class is a known vocabulary term','Not run','Data stewards']],
 'Ontology conformance':[['Every pipeline output maps to an entity','Failed','Data stewards'],['No attribute without a unit or type','Passed','Data stewards'],['References to other models resolve','Passed','Data stewards']],
 'Release readiness':[['All test suites green on staging','Passed','Release manager'],['No open errors in Problems','Failed','Release manager'],['Linked repositories pinned to tags','Failed','Release manager'],['Runbooks reviewed this quarter','Passed','Operations']]};
export const CHECKK:Partial<Record<KindName,CheckRow[]>>={testsuite:[['Happy path','Passed','QA'],['Late arriving data','Passed','QA'],['Schema drift','Passed','QA'],['Empty batch','Passed','QA'],['Duplicate delivery','Not run','QA']],procedure:[['Prepare the environment','Passed','Operations'],['Run the checks','Passed','Operations'],['Review the results','Not run','Operations'],['Sign off','Not run','Release manager']],evalset:[['Storm week, February','Passed','Data science'],['Heat wave, July','Passed','Data science'],['Holiday period','Failed','Data science'],['Ordinary week','Passed','Data science']]};
