/* The catalogue: the kinds of item the product knows, what each tool is called, the lists the tools offer a choice from, and the icons. It is the same whatever project is open. */
import { Catalogue, type RecipeElement } from '../gen/adp/storage/v1/catalogue_pb';
import type { Link } from '../link';
import type { IconGroup, KindInfo, KindName, RecipeAreaInfo, RecipeElementInfo, RecipeInfo, SolutionSizeInfo, ToolName, ToolWord, WizardQuestionInfo } from '../views';

/* the wizard as it was read: its questions and recipes still say which answers they are for */
interface Wizard {
  sizes: SolutionSizeInfo[];
  questions: (WizardQuestionInfo & { sizes: readonly string[] })[];
  recipes: (RecipeInfo & { sizes: readonly string[]; needs: readonly string[] })[];
  areas: RecipeAreaInfo[];
  brief: string;
}

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
  private wizard: Wizard | null = null;

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
  /* What the New Project wizard asks; read when the wizard opens, and once. */
  async loadWizard(): Promise<void> {
    if (this.wizard) return;
    const w = await this.link.call(Catalogue.method.readProjectWizard, {});
    const element = (e: RecipeElement): RecipeElementInfo => ({ name: e.name, kind: e.kind, icon: e.icon, children: e.children.map(element) });
    const count = (list: readonly RecipeElementInfo[]): number => list.reduce((n, e) => n + 1 + count(e.children), 0);
    this.wizard = {
      sizes: w.sizes.map(s => ({ id: s.id, label: s.label, about: s.about, icon: s.icon, scale: s.scale, parts: s.parts, suggests: s.suggests })),
      questions: w.questions.map(q => ({ id: q.id, title: q.title, about: q.about, step: q.step === 'delivery' ? 'delivery' : 'technology', options: q.options.map(o => ({ id: o.id, label: o.label, about: o.about })), sizes: q.sizes })),
      recipes: w.recipes.map(r => { const elements = r.elements.map(element); return { id: r.id, name: r.name, about: r.about, area: r.area, elements, count: count(elements), sizes: r.sizes, needs: r.needs }; }),
      areas: w.areas.map(a => ({ name: a.name, icon: a.icon })),
      brief: w.brief,
    };
  }
  get sizes(): readonly SolutionSizeInfo[] { return this.wizard?.sizes ?? []; }
  get areas(): readonly RecipeAreaInfo[] { return this.wizard?.areas ?? []; }
  /* the name of the document a new project starts with */
  get brief(): string { return this.wizard?.brief ?? ''; }
  /* the questions that are asked for a size, and the recipes that are offered for a size and the options that were chosen */
  questionsFor(sizeId: string): readonly WizardQuestionInfo[] { return (this.wizard?.questions ?? []).filter(q => !q.sizes.length || q.sizes.includes(sizeId)); }
  recipesFor(sizeId: string, optionIds: Iterable<string>): readonly RecipeInfo[] {
    const chosen = new Set(optionIds);
    return (this.wizard?.recipes ?? []).filter(r => (!r.sizes.length || r.sizes.includes(sizeId)) && r.needs.every(id => chosen.has(id)));
  }

  /* a kind the catalogue does not know still shows, as a plain file */
  kind(name: KindName): KindInfo { return this.kinds[name] ?? { name, label: name, icon: 'file', colour: 'muted' }; }
  /* one of the lists the tools offer a choice from, by its name */
  options(name: string): readonly string[] { return this.lists.get(name) ?? []; }
}
