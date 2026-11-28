/* Example data: the conversations with the agent that are over, newest first. A message names the items it is about by the names they have in the example. */

export interface Said {
  /* true for what the user said */
  mine?: true;
  text: string;
  time: string;
  items?: string[];
  /* what the agent did to get to its answer */
  steps?: string[];
}
export interface Talk { title: string; day: string; time: string; said: Said[] }

export const talks: Talk[] = [
  {
    title: 'Why does the meter readings pipeline fail validation?', day: 'Today', time: '09:41', said: [
      { mine: true, text: 'Why does the meter readings pipeline fail validation?', time: '09:38', items: ['Meter readings to Bronze'] },
      { text: 'Its step "Map to ontology" writes Meter.tariffClass, and Meter in the Asset model has no attribute of that name: it has serialNumber, installedOn and intervalMinutes. The step before it, Deduplicate, is new as well, and the model was not changed with the pipeline.\n\nThere are two ways out:\n• Add tariffClass to Meter in the Asset model, as an enum that takes its values from the Tariff classes vocabulary. That vocabulary is new and nothing uses it yet, so this is probably what was meant.\n• Take the mapping out of the step until the model has the attribute.', time: '09:39', items: ['Meter readings to Bronze', 'Asset model', 'Tariff classes'], steps: ['Read Meter readings to Bronze: 8 steps', 'Read the entity types of Asset model', 'Read what validation found'] },
      { mine: true, text: 'The first. What type should the attribute have?', time: '09:40' },
      { text: 'An enum. Tariff classes holds Residential and Commercial as concepts, so the attribute reads "tariffClass: enum" on Meter. I would not make it required: a meter that has no contract yet has no tariff either.\n\nAfter that the pipeline validates, and Tariff classes loses its note that nothing uses it.', time: '09:41', items: ['Asset model', 'Tariff classes'], steps: ['Read Tariff classes'] },
    ],
  },
  {
    title: 'What is left before we can release to production?', day: 'Yesterday', time: '17:34', said: [
      { mine: true, text: 'What is left before we can release to production?', time: '17:31', items: ['Deploy to production'] },
      { text: 'Three things stand between this branch and production:\n• Deploy to production has an approval gate with no approver group, so the gate can never be passed. That is an error.\n• Identity and access is pinned to the branch release/2.x. A release that follows a branch is not repeatable; v2.4.1 is its newest tag.\n• Release readiness, the validation procedure, fails two of its four checks for exactly these reasons: open errors in Problems, and a linked repository that is not pinned to a tag.\n\nIts check that all test suites are green on staging passes.', time: '17:33', items: ['Deploy to production', 'Identity and access', 'Release readiness'], steps: ['Read the release pipelines and the environments', 'Read what validation found', 'Read the linked repositories and what they follow'] },
      { mine: true, text: 'Who can approve?', time: '17:34' },
      { text: 'The project does not say. Production says that an approval is needed, without saying whose, and Release readiness names a release manager as the owner of its checks. Roles and permissions, in Identity and access, is where a role for it would be defined: it has User, Role and Permission.', time: '17:34', items: ['Production', 'Release readiness', 'Roles and permissions'], steps: ['Read Production', 'Read Roles and permissions'] },
    ],
  },
  {
    title: 'The map on the Outage map page shows nothing', day: 'Yesterday', time: '11:08', said: [
      { mine: true, text: 'The map on the Outage map page shows nothing. What should it be bound to?', time: '11:05', items: ['Outage map'] },
      { text: 'The Map component on that page has no data binding, which is why it draws its background and no outages.\n\nThe table below it gets its rows from Outage heatmap in Data analysis. The map needs places as well, and those are in Grid topology: a Feeder is fed by a Substation, which a Region contains. Bind the map to Grid topology and it can place each outage on its feeder.', time: '11:07', items: ['Outage map', 'Grid topology', 'Outage heatmap'], steps: ['Read Outage map: 5 sections', 'Read the entity types of Grid topology'] },
      { mine: true, text: 'Good, I will do that after the review.', time: '11:08' },
      { text: 'Then the warning on Outage map stays until the binding is set. Nothing else on the page depends on it.', time: '11:08', items: ['Outage map'] },
    ],
  },
  {
    title: 'Which pipelines read the smart meter source?', day: 'Monday', time: '14:52', said: [
      { mine: true, text: 'Which pipelines read the smart meter source?', time: '14:51', items: ['Smart meter readings'] },
      { text: 'One: Meter readings to Bronze. It validates the readings against the schema Meter reading, removes duplicates and writes Bronze meter readings and, past its quality gate, Silver meter readings.\n\nPast that pipeline, Load forecast names it as its training data. A change to the source or to its schema reaches both.', time: '14:52', items: ['Meter readings to Bronze', 'Meter reading', 'Load forecast'], steps: ['Read Smart meter readings', 'Read the pipelines under Ingestion', 'Searched for what uses Meter readings to Bronze'] },
    ],
  },
  {
    title: 'Summarise what changed in the load forecast', day: 'Last week', time: '24 Nov', said: [
      { mine: true, text: 'Summarise what changed in the load forecast since the last release.', time: '16:12', items: ['Load forecast'] },
      { text: 'Since v0.8.0 one commit touched it, "Tune load forecast model and add the 2025 backtest" by Mei Tanaka on 23 Nov, which came in with pull request #207 a day later.\n• The model forecasts the system load of the next 48 hours and is retrained weekly.\n• Forecast backtest 2025 is its evaluation set. Validation notes that the set is 43 days older than the model, so its figures say little about the last tuning.\n• Forecast error analysis, the notebook, plots the error per hour of the day.', time: '16:14', items: ['Load forecast', 'Forecast backtest 2025', 'Forecast error analysis'], steps: ['Read the log since v0.8.0', 'Read Load forecast', 'Searched for what uses Load forecast'] },
    ],
  },
  {
    title: 'How do the linked repositories get updated?', day: 'Earlier', time: '14 Nov', said: [
      { mine: true, text: 'How do the linked repositories get updated?', time: '10:20', items: ['Components'] },
      { text: 'Each linked repository follows one branch or tag, which is set in the Properties of the item it is linked in at. Design system follows the tag v3.2.0 and Audit logging v1.8.2, so they change only when somebody picks another tag. Identity and access follows the branch release/2.x and moves with every fetch.\n\nAudit logging has a newer tag, v1.9.0. What is inside a linked repository is read-only here: a change is made in its own project and arrives with the next tag.', time: '10:22', items: ['Design system', 'Audit logging', 'Identity and access'], steps: ['Read the linked repositories and what they follow'] },
    ],
  },
];
