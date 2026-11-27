/* Example data: the uncommitted changes, grouped by item. */
'use strict';

const CH=[['Meter readings to Bronze',[['pipeline.did','M'],['transform.sql','M']]],['Smart meter readings',[['smart-meter-readings.source.yaml','M']]],['Asset model',[['model.did','M']]],['Tariff classes',[['tariff-classes.skos.ttl','A']]],['Outage map',[['page.ded','A'],['page.html','A'],['page.css','A']]],['Ontology conformance',[['ontology-conformance.procedure.ded','A']]],['Pipelines',[['.adp','M']]]].map(([nm,fs])=>({node:find(nm),files:fs.map(([f,s])=>({f,s,on:true}))}));
