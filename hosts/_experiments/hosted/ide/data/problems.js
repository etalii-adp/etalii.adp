/* Example data: what validation found in the solution. */
'use strict';

const PROBLEMS=[
 ['error','Step "Map to ontology" writes Meter.tariffClass, which Asset model does not define','Meter readings to Bronze'],
 ['error','Approval gate has no approver group','Deploy to production'],
 ['warning','Pinned to branch release/2.x. A tag gives repeatable releases','Identity and access'],
 ['warning','Component "Map" has no data binding','Outage map'],
 ['warning','2 rules have no owner','Data quality rules'],
 ['info','Evaluation set is 43 days older than the model','Load forecast'],
 ['info','v1.9.0 is available, pinned to v1.8.2','Audit logging'],
 ['info','Not used by any page, pipeline or model yet','Tariff classes']
].map(([s,m,at])=>({s,m,node:find(at)}));
