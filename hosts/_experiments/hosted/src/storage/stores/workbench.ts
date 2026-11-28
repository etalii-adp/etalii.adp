/* The workbench: a window's own state, such as the selection, the open tabs and where the tool windows are. It is read when the window opens and kept a moment after it changed; nobody else is told of it. */
import { create } from '@bufbuild/protobuf';
import { Workbench, WorkbenchSnapshotSchema } from '../gen/adp/storage/v1/workbench_pb';
import type { Link } from '../link';
import type { WindowState } from '../views';

/* how long after a change it is kept, so a run of changes is one write */
const KEEP_MS = 300;

export class WorkbenchStore {
  /* the state as it was read; a window takes it once, and hands in its own from then on */
  state: WindowState = { selectedId: '', documentId: '', tabIds: [], expandedIds: [], documentModes: {}, views: {}, ownViews: [], docks: {}, active: {}, hiddenSeverities: [], git: { branch: '', user: '', days: 0 }, runTargetId: '' };
  private kept = '';
  private timer: ReturnType<typeof setTimeout> | undefined;
  private next: (() => WindowState) | null = null;

  constructor(private readonly link: Link, private readonly projectId: string) {}

  async load(): Promise<void> {
    const w = await this.link.call(Workbench.method.read, { projectId: this.projectId });
    this.state = {
      selectedId: w.selectedId, documentId: w.documentId, tabIds: [...w.tabIds], expandedIds: [...w.expandedIds], documentModes: { ...w.documentModes },
      views: Object.fromEntries(Object.entries(w.views).map(([id, v]) => [id, { x: v.x, y: v.y, k: v.k }])), ownViews: [...w.ownViews], docks: { ...w.docks }, active: { ...w.active },
      hiddenSeverities: [...w.hiddenSeverities], git: { branch: w.git?.branch ?? '', user: w.git?.user ?? '', days: w.git?.days ?? 0 }, runTargetId: w.runTargetId, commitMessage: w.commitMessage,
    };
    this.kept = JSON.stringify(this.state);
  }

  /* keeps the window's state a moment from now; read is asked for it then, so a run of changes is read once */
  keepSoon(read: () => WindowState): void {
    this.next = read;
    this.timer ??= setTimeout(() => this.keepNow(), KEEP_MS);
  }
  /* keeps it at once, as when the page is left */
  keepNow(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    if (!this.next) return;
    const state = this.next(), text = JSON.stringify(state);
    this.next = null;
    if (text === this.kept) return;
    this.kept = text;
    /* a write that does not arrive is no loss: the next change writes the whole state again */
    this.link.call(Workbench.method.write, { projectId: this.projectId, workbench: create(WorkbenchSnapshotSchema, state) }).catch(() => { this.kept = ''; });
  }
}
