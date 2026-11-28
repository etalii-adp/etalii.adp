/* The catalogue: the kinds of item the product knows, what each tool is called, the lists the tools offer a choice from, and the icons. It is the same whatever project is open. */
import { Catalogue } from '../gen/adp/storage/v1/catalogue_pb';
import type { Link } from '../link';
import type { IconGroup, KindInfo, KindName, ToolName, ToolWord } from '../views';

export interface Icons {
  /* the drawing of each icon, by its name */
  readonly drawings: Readonly<Record<string, string>>;
  /* the icons a person picks from, by category and by domain */
  readonly general: readonly IconGroup[];
  readonly byDomain: readonly IconGroup[];
  readonly all: readonly IconGroup[];
  readonly count: number;
}

export class CatalogueStore {
  /* the version of the product, as its pages show it */
  product = '';
  readonly kinds: Record<KindName, KindInfo> = {};
  /* the kinds an item of a kind takes, where the kind decides it; and what a level takes that says nothing itself */
  readonly takes: Record<KindName, readonly KindName[]> = {};
  defaultAccepts: readonly KindName[] = [];
  readonly words: Partial<Record<ToolName, ToolWord>> = {};
  private readonly lists = new Map<string, readonly string[]>();
  icons: Icons = { drawings: {}, general: [], byDomain: [], all: [], count: 0 };

  constructor(private readonly link: Link) {}

  async load(): Promise<void> {
    const c = await this.link.call(Catalogue.method.read, {});
    this.product = c.product;
    this.defaultAccepts = c.defaultAccepts;
    for (const k of c.kinds) {
      this.kinds[k.name] = { name: k.name, label: k.label, icon: k.icon, colour: k.colour, stored: k.storedInside ? '@' : k.storedFiles.length ? k.storedFiles : k.storedSuffix || undefined, tool: (k.tool || undefined) as ToolName | undefined };
      if (k.takes.length) this.takes[k.name] = k.takes;
    }
    for (const [tool, word] of Object.entries(c.words)) this.words[tool as ToolName] = word as ToolWord;
    for (const o of c.options) this.lists.set(o.name, o.options);
  }
  async loadIcons(): Promise<void> {
    const i = await this.link.call(Catalogue.method.readIcons, {});
    const groups = (domain: boolean): IconGroup[] => i.groups.filter(g => g.domain === domain).map(g => [g.name, g.icons.map(o => ({ nm: o.name, label: o.label, kw: o.keywords }))]);
    const general = groups(false), byDomain = groups(true);
    this.icons = { drawings: i.drawings, general, byDomain, all: [...general, ...byDomain], count: i.count };
  }
  /* a kind the catalogue does not know still shows, as a plain file */
  kind(name: KindName): KindInfo { return this.kinds[name] ?? { name, label: name, icon: 'file', colour: 'muted' }; }
  /* one of the lists the tools offer a choice from, by its name */
  options(name: string): readonly string[] { return this.lists.get(name) ?? []; }
}
