/* Example data: queries and notebooks. */
'use strict';

const CODE={
 'Peak load by feeder':`-- Peak load per feeder over the last 7 days\nselect f.code as feeder,\n       max(r.load_kw) as peak_kw,\n       count(*) as readings\nfrom silver.meter_readings r\njoin ontology.feeder f on f.id = r.feeder_id\nwhere r.read_at >= now() - interval '7 days'\ngroup by f.code\norder by peak_kw desc\nlimit 20`,
 'Meters without readings':`-- Meters that reported nothing in the last 24 hours\nselect m.serial_number, sp.address\nfrom ontology.meter m\njoin ontology.service_point sp on sp.id = m.service_point_id\nleft join silver.meter_readings r\n  on r.meter_id = m.id and r.read_at >= now() - interval '24 hours'\nwhere r.meter_id is null\norder by sp.address`};
