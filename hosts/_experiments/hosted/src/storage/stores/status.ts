/* Status: what validation found, the environments, and what was started. */
import { fromBinary } from '@bufbuild/protobuf';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import { RunScope, Severity as KeptSeverity, Status, StatusSnapshotSchema, type StatusSnapshot } from '../gen/adp/storage/v1/status_pb';
import type { Link } from '../link';
import type { Done, Item, Problem, Severity } from '../views';
import type { SolutionStore } from './solution';

const severities: Record<number, Severity> = { [KeptSeverity.ERROR]: 'error', [KeptSeverity.WARNING]: 'warning', [KeptSeverity.INFO]: 'info' };

export interface EnvironmentInfo { readonly name: string; readonly healthy: boolean; readonly note: string }

export class StatusStore {
  revision = 0;
  problems: readonly Problem[] = [];
  environments: readonly EnvironmentInfo[] = [];
  /* what the run button starts until a person picks something else */
  defaultRun: Item | null = null;

  constructor(private readonly link: Link, private readonly projectId: string, private readonly solution: SolutionStore) {
    link.listen('Status', projectId, event => this.apply(event), () => this.load());
  }
  async load(): Promise<void> { this.take(await this.link.call(Status.method.read, { projectId: this.projectId })); }

  validate(): Promise<Done> { return this.link.call(Status.method.validate, { projectId: this.projectId }); }
  /* starts one item; as the run button's target it is started as it is, without a word on where */
  run(x: Item, asTarget = false): Promise<Done> { return this.link.call(Status.method.run, { projectId: this.projectId, itemId: x.id, scope: asTarget ? RunScope.TARGET : RunScope.ITEM }); }
  runTestSuites(): Promise<Done> { return this.link.call(Status.method.run, { projectId: this.projectId, scope: RunScope.TEST_SUITES }); }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    this.take(fromBinary(StatusSnapshotSchema, event.changes));
  }
  private take(s: StatusSnapshot): void {
    this.revision = s.revision;
    this.problems = s.problems.flatMap(p => { const node = this.solution.byId(p.itemId); return node ? [{ s: severities[p.severity] ?? 'info', m: p.message, node }] : []; });
    this.environments = s.environments.map(e => ({ name: e.name, healthy: e.healthy, note: e.note }));
    this.defaultRun = this.solution.byId(s.defaultRunId) ?? null;
  }
}
