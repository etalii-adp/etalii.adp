/* Example data: the figures of each analysis view. */
export interface Dashboard {
  /* the three figures at the top: label, value, note */
  k: [label: string, value: string, note: string][];
  /* the line chart: title, unit, the name of the second line, and the level and swing of the curve */
  lt: string;
  lu: string;
  l2: string;
  base: number;
  amp: number;
  /* the bar chart: title and bars */
  bt: string;
  bars: [label: string, value: number][];
}

export const DASH:Record<string,Dashboard>={'Load forecast overview':{k:[['Peak load today','742 MW','3.1% above forecast'],['Forecast error (MAPE)','2.8 %','7-day average'],['Meters reporting','98.6 %','1,204,318 of 1,221,400']],lt:'System load, last 24 hours',lu:'MW',l2:'Forecast',base:560,amp:170,bt:'Peak load by region',bars:[['North',212],['East',148],['South',231],['West',96],['Centre',155]]},
 'Outage heatmap':{k:[['Active outages','3','412 homes affected'],['Average restore time','1 h 42 min','last 30 days'],['Planned work','7','next 14 days']],lt:'Homes without power, last 24 hours',lu:'homes',l2:'Same day last week',base:300,amp:240,bt:'Outages by region, last 30 days',bars:[['North',14],['East',9],['South',21],['West',6],['Centre',11]]},
 'Data quality monitor':{k:[['Rules passing','46 of 48','2 failing since 09:15'],['Late batches','1','Smart meter readings'],['Quarantined records','1,932','0.16% of today']],lt:'Records ingested per hour',lu:'thousand',l2:'Expected',base:480,amp:140,bt:'Failed checks by source, last 7 days',bars:[['Smart meters',12],['SCADA',3],['Weather',1],['CRM',5]]}};
