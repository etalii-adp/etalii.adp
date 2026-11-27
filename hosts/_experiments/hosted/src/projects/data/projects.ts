/* Example data: the projects and assets on this computer. */

export interface Project {
  name: string;
  /* two letters and a colour, for its badge */
  initials: string;
  colour: string;
  path: string;
  branch: string;
  about: string;
  opened: string;
  /* a repository that is linked into other projects */
  asset: boolean;
}

const rows: [name: string, initials: string, colour: string, path: string, branch: string, about: string, opened: string, asset: 0 | 1][] = [
  ['Atlas Platform', 'AP', 'blue', '~/git/atlas-platform', 'develop', 'Platform · 9 areas, 96 items · 3 linked repositories', '2 minutes ago', 0],
  ['Field Service App', 'FS', 'teal', '~/git/field-service-app', 'main', 'Application · 14 items · 2 linked repositories', 'Yesterday', 0],
  ['Tariff Calculator', 'TC', 'orange', '~/git/tariff-calculator', 'features/time-of-use', 'Application · 6 items', '3 days ago', 0],
  ['Design system', 'DS', 'purple', '~/git/shared/design-system', 'main', 'Asset · linked into 3 projects', 'Last week', 1],
  ['Identity and access', 'IA', 'red', '~/git/shared/identity-access', 'release/2.x', 'Asset · linked into 2 projects', 'Last week', 1],
  ['Audit logging', 'AL', 'green', '~/git/shared/audit-logging', 'main', 'Asset · linked into 2 projects', '12 Nov', 1]];

export const projects: Project[] = rows.map(([name, initials, colour, path, branch, about, opened, asset]) => ({ name, initials, colour, path, branch, about, opened, asset: !!asset }));
