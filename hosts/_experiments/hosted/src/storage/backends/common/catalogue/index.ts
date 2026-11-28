/* The catalogue every backend in this page serves: the kinds, the words and the icons of the product. It is the same whatever project is open, so it is here once and not in the data of a project. */
import { create } from '@bufbuild/protobuf';
import { CatalogueSnapshotSchema, IconsSnapshotSchema, ProjectWizardSchema, type CatalogueSnapshot, type IconsSnapshot, type ProjectWizard } from '../../../gen/adp/storage/v1/catalogue_pb';
import { ICON_COUNT, ICONSET, GENERAL, libraryIcons } from './icon-library';
import { DEFAULT_ACCEPTS, KINDS, OPTIONS, WORDS } from './kinds';
import { AREAS, QUESTIONS, RECIPES, SIZES, WIZARD_VERSION } from './wizard';

/* changes when anything in this folder does */
const VERSION = '2026.3-2';

export const catalogue = (): CatalogueSnapshot => create(CatalogueSnapshotSchema, {
  version: VERSION, product: '2026.3', kinds: KINDS, words: WORDS, defaultAccepts: DEFAULT_ACCEPTS,
  options: Object.entries(OPTIONS).map(([name, options]) => ({ name, options })),
});

export const icons = (): IconsSnapshot => create(IconsSnapshotSchema, {
  version: VERSION, drawings: libraryIcons, count: ICON_COUNT,
  groups: ICONSET.map(([name, list], i) => ({ name, domain: i >= GENERAL.length, icons: list.map(o => ({ name: o.nm, label: o.label, keywords: o.kw })) })),
});

export const projectWizard = (): ProjectWizard => create(ProjectWizardSchema, { version: WIZARD_VERSION, sizes: SIZES, questions: QUESTIONS, recipes: RECIPES, areas: AREAS, brief: 'Project brief' });
