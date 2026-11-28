/* The levels: how each level of the hierarchy shows, the layout its canvas shares, and the places of the cards a person moved. */
import { fromBinary } from '@bufbuild/protobuf';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';
import { Levels, LevelsSnapshotSchema, ViewMode as KeptView, type LevelsSnapshot, type Place } from '../gen/adp/storage/v1/levels_pb';
import type { Link } from '../link';
import type { Done, Item, Point, ViewMode, Writable } from '../views';
import type { SolutionStore } from './solution';

const places = (list: Place[]): Map<string, Point> | undefined => list.length ? new Map(list.map(p => [p.itemId, { x: p.x, y: p.y }])) : undefined;

export class LevelsStore {
  revision = 0;
  constructor(private readonly link: Link, private readonly projectId: string, private readonly solution: SolutionStore) {
    link.listen('Levels', projectId, event => this.apply(event), () => this.load());
  }
  async load(): Promise<void> { this.take(await this.link.call(Levels.method.read, { projectId: this.projectId })); }

  setView(x: Item, mode: ViewMode): Promise<Done> { return this.link.call(Levels.method.setView, { projectId: this.projectId, itemId: x.id, view: mode === 'files' ? KeptView.FILES : KeptView.LOGICAL }); }
  setShowAll(x: Item, showAll: boolean): Promise<Done> { return this.link.call(Levels.method.setShowAll, { projectId: this.projectId, itemId: x.id, showAll }); }
  /* keeps where a person put the cards of a level, by the id of each card's item */
  setLayout(level: Item, at: ReadonlyMap<string, Point>): Promise<Done> { return this.link.call(Levels.method.setLayout, { projectId: this.projectId, itemId: level.id, places: [...at].map(([itemId, p]) => ({ itemId, x: p.x, y: p.y })) }); }
  resetLayout(level: Item): Promise<Done> { return this.link.call(Levels.method.resetLayout, { projectId: this.projectId, itemId: level.id }); }

  private apply(event: Event): void {
    if (event.revision <= this.revision) return;
    this.take(fromBinary(LevelsSnapshotSchema, event.changes));
  }
  private take(s: LevelsSnapshot): void {
    this.revision = s.revision;
    for (const x of this.solution.all() as IterableIterator<Writable<Item>>) { x.mode = undefined; x.showAll = undefined; x.shared = undefined; x.own = undefined; }
    for (const l of s.levels) {
      const x = this.solution.byId(l.itemId) as Writable<Item> | undefined;
      if (!x) continue;
      x.mode = l.view === KeptView.FILES ? 'files' : l.view === KeptView.LOGICAL ? 'logical' : undefined;
      x.showAll = l.showAll;
      x.shared = places(l.layout);
      x.own = places(l.ownLayout);
    }
  }
}
