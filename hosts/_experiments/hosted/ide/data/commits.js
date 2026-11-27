/* Example data: the commit log and where each branch and tag points. */
'use strict';

const COMMITS=[
 {h:'a91f3c2',l:0,p:[2],m:'Add dedupe step to the meter readings pipeline',a:'Sam Rivera',w:'Today 10:42',d:0},
 {h:'7be20d4',l:1,p:[2,3],m:'Merge pull request #214 from features/outage-map',a:'Priya Nair',w:'Today 09:58',d:0},
 {h:'5c0e8aa',l:0,p:[4],m:'Pin Identity and access to release/2.x for the access review',a:'Jonas Weber',w:'Yesterday 17:20',d:1},
 {h:'d3371f9',l:2,p:[5],m:'Bind outage table to the Grid topology ontology',a:'Priya Nair',w:'Yesterday 16:05',d:1},
 {h:'19ac5b0',l:0,p:[6],m:'Add ontology conformance procedure',a:'Mei Tanaka',w:'Yesterday 11:31',d:1},
 {h:'e84b112',l:2,p:[6],m:'Add Outage map page with the Map component',a:'Priya Nair',w:'24 Nov',d:3},
 {h:'c2d9e07',l:0,p:[8,7],m:'Merge pull request #207 from features/load-forecast',a:'Jonas Weber',w:'24 Nov',d:3},
 {h:'40f6a3d',l:1,p:[9],m:'Tune load forecast model and add the 2025 backtest',a:'Mei Tanaka',w:'23 Nov',d:4},
 {h:'9d1b7e5',l:0,p:[9],m:'Switch Design system to v3.2.0',a:'Sam Rivera',w:'22 Nov',d:5},
 {h:'b7730c8',l:0,p:[10],m:'Add weather enrichment pipeline',a:'Jonas Weber',w:'20 Nov',d:7},
 {h:'6a4e2f1',l:0,p:[11],m:'Model the asset hierarchy in the ontology',a:'Mei Tanaka',w:'18 Nov',d:9},
 {h:'2f8c9d6',l:0,p:[12],m:'Release 0.8.0',a:'Jonas Weber',w:'14 Nov',d:13},
 {h:'f05a1b3',l:0,p:[],m:'Add staging and production release pipelines',a:'Sam Rivera',w:'12 Nov',d:15}];
const HEADS={develop:0,'origin/develop':1,'origin/features/outage-map':3,'features/load-forecast':7,'v0.8.0':11};
