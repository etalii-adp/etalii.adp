/* Example data: the steps of the data pipelines and release pipelines. */
'use strict';

const lin=(...a)=>({nodes:a.map(([nm,t,f],i)=>({n:nm,t,x:i,y:0,f})),edges:a.slice(1).map((_,i)=>[i,i+1])});
const FLOW={
 'Meter readings to Bronze':{nodes:[{n:'SFTP drop',t:'Source',x:0,y:0},{n:'Kafka · meter.readings',t:'Source',x:0,y:1},{n:'Validate schema',t:'Validate',x:1,y:.5},{n:'Deduplicate',t:'Transform',x:2,y:.5,f:'new'},{n:'Map to ontology',t:'Map',x:3,y:.5,f:'err'},{n:'Bronze · meter_readings',t:'Sink',x:4,y:0},{n:'Quality gate',t:'Validate',x:4,y:1},{n:'Silver · meter_readings',t:'Sink',x:5,y:1}],edges:[[0,2],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7]]},
 'Telemetry stream':lin(['Kafka · scada.events','Source'],['Parse frames','Transform'],['Window 1 min','Transform'],['Map to ontology','Map'],['Bronze · telemetry','Sink']),
 'Deploy to staging':lin(['Fetch artefacts','Stage'],['Provision','Deploy'],['Deploy','Deploy'],['Smoke test','Test'],['Notify team','Stage']),
 'Deploy to production':lin(['Fetch artefacts','Stage'],['Approval gate','Gate','err'],['Deploy blue/green','Deploy'],['Smoke test','Test'],['Shift traffic','Deploy'])};
const FLOWK={pipeline:lin(['Read source','Source'],['Validate schema','Validate'],['Transform','Transform'],['Map to ontology','Map'],['Write Bronze','Sink']),release:lin(['Checkout','Stage'],['Build','Stage'],['Validate definitions','Test'],['Run test suites','Test'],['Publish artefacts','Deploy'])};
