/* Example data: the uncommitted changes, grouped by item. */
import type { Vcs } from './draft';

export const changed:[item:string,files:[name:string,state:Vcs][]][]=[['Meter readings to Bronze',[['pipeline.did','M'],['transform.sql','M']]],['Smart meter readings',[['smart-meter-readings.source.yaml','M']]],['Asset model',[['model.did','M']]],['Tariff classes',[['tariff-classes.skos.ttl','A']]],['Outage map',[['page.ded','A'],['page.html','A'],['page.css','A']]],['Ontology conformance',[['ontology-conformance.procedure.ded','A']]],['Pipelines',[['.adp','M']]]];
