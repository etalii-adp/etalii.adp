/* Example data: the fields of each data schema and where each schema is used. */
import type { SchemaField } from '../../documents';

export const SCHEMA:Record<string,SchemaField[]>={
 'Meter reading':[['meterId','string',true,'pattern ^M[0-9]{8}$','Meter.serialNumber'],['readAt','datetime',true,'not in the future',''],['value','decimal',true,'minimum 0',''],['unit','enum',true,'kWh | kW | V',''],['intervalMinutes','int',false,'15, 30 or 60','Meter.intervalMinutes'],['quality','enum',false,'ok | estimated | missing',''],['tariffClass','string',false,'','Meter.tariffClass']],
 'Telemetry event':[['substation','string',true,'','Substation.name'],['feeder','string',true,'','Feeder.code'],['measuredAt','datetime',true,'',''],['currentA','decimal',true,'minimum 0','Feeder.ratedCurrent'],['switchState','enum',false,'open | closed','']],
 'Customer record':[['customerNumber','string',true,'unique','Customer.customerNumber'],['name','string',true,'','Customer.name'],['segment','enum',false,'residential | commercial','Customer.segment'],['address','string',true,'','ServicePoint.address']],
 'Outage report':[['postcode','string',true,'pattern ^[0-9]{4} ?[A-Z]{2}$',''],['houseNumber','int',true,'minimum 1',''],['observation','enum',true,'street | house | flicker | cable',''],['contactNumber','string',false,'','']]};
/* the fields of a schema the example data says nothing about */
export const SCHEMAD:SchemaField[]=[['id','string',true,'unique',''],['recordedAt','datetime',true,'',''],['value','decimal',false,'','']];
/* the items that use each schema */
export const SUSED:Record<string,string[]>={'Meter reading':['Smart meter readings','Meter readings to Bronze'],'Telemetry event':['SCADA telemetry','Telemetry stream'],'Customer record':['CRM export','Customer sync'],'Outage report':['Report an outage','Outage triage agent'],'Weather observation':['Weather feed','Weather enrichment'],'Bronze meter readings':['Meter readings to Bronze'],'Silver meter readings':['Meter readings to Bronze','Load forecast','Peak load by feeder'],'Silver telemetry':['Telemetry stream','Anomaly detection'],'Usage summary':['My usage']};
