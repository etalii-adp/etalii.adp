/* Example data: the uncommitted changes, grouped by item. */
import { must } from '../model';
import type { Item, Vcs } from '../types';

export interface Change { node: Item; files: { f: string; s: Vcs; on: boolean }[] }

const changed:[item:string,files:[name:string,state:Vcs][]][]=[['Meter readings to Bronze',[['pipeline.did','M'],['transform.sql','M']]],['Smart meter readings',[['smart-meter-readings.source.yaml','M']]],['Asset model',[['model.did','M']]],['Tariff classes',[['tariff-classes.skos.ttl','A']]],['Outage map',[['page.ded','A'],['page.html','A'],['page.css','A']]],['Ontology conformance',[['ontology-conformance.procedure.ded','A']]],['Pipelines',[['.adp','M']]]];
export const CH:Change[]=changed.map(([nm,fs])=>({node:must(nm),files:fs.map(([f,s])=>({f,s,on:true}))}));
