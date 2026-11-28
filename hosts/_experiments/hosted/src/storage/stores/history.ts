/* History: the commands that changed the project, taking the last one back, and doing it again. */
import { fromBinary } from '@bufbuild/protobuf';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import { History, HistorySnapshotSchema, type HistorySnapshot } from '../gen/adp/storage/v1/history_pb';
import type { Link } from '../link';
import type { Done } from '../views';

export class HistoryStore {
  revision = 0;
  /* what Undo would take back and Redo would do again, in a few words; empty when there is nothing */
  undoLabel = '';
  redoLabel = '';

  constructor(private readonly link: Link, private readonly projectId: string) {
    link.listen('History', projectId, event => this.apply(event), () => this.load());
  }
  async load(): Promise<void> { this.take(await this.link.call(History.method.read, { projectId: this.projectId })); }

  /* takes back the last change; with the name of a change, only when that one is the last */
  undo(change = ''): Promise<Done> { return this.link.call(History.method.undo, { projectId: this.projectId, entryId: change }); }
  redo(): Promise<Done> { return this.link.call(History.method.redo, { projectId: this.projectId }); }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    this.take(fromBinary(HistorySnapshotSchema, event.changes));
  }
  private take(h: HistorySnapshot): void { this.revision = h.revision; this.undoLabel = h.undoLabel; this.redoLabel = h.redoLabel; }
}
