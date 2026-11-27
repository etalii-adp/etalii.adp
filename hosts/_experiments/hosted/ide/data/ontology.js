/* Example data: the entity types and relations of each ontology model. */
'use strict';

const ONTO={
 'Asset model':{e:[['Substation',0,0,['name: text','voltageLevel: kV','location: geo']],['Feeder',250,0,['code: text','ratedCurrent: A']],['Transformer',500,0,['rating: kVA','phases: 1 | 3']],['Meter',250,180,['serialNumber: text','installedOn: date','intervalMinutes: int']],['ServicePoint',500,180,['address: text','connectionType: enum']],['Customer',750,180,['customerNumber: text'],'Customer model']],r:[[0,1,'feeds'],[1,2,'supplies'],[2,4,'serves'],[4,3,'measuredBy'],[5,4,'holds']]},
 'Customer model':{e:[['Customer',0,0,['customerNumber: text','name: text','segment: enum']],['Contract',250,0,['startDate: date','tariff: TariffClass']],['Account',500,0,['balance: EUR']],['ServicePoint',250,170,['address: text'],'Asset model']],r:[[0,1,'signs'],[1,2,'billedTo'],[1,3,'covers']]},
 'Grid topology':{e:[['Region',0,0,['name: text']],['Substation',250,0,['name: text'],'Asset model'],['Switch',500,0,['state: open | closed']],['Feeder',250,170,['code: text'],'Asset model']],r:[[0,1,'contains'],[1,3,'feeds'],[2,3,'isolates']]},
 'Roles and permissions':{e:[['User',0,0,['email: text']],['Role',250,0,['name: text']],['Permission',500,0,['action: enum','scope: text']]],r:[[0,1,'has'],[1,2,'grants']]}};
