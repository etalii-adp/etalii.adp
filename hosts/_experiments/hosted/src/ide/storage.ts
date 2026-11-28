/* The stores the IDE page reads, once they are open: storage for what every page shares, project for the project the page shows. With them, the one way the page carries out a command and says what came of it. */
import { reason } from '../common/reason';
import { toast } from '../common/popups';
import { connect, Refused, visit, type Done, type ProjectStorage, type Storage } from '../storage';
import { repaintEverything } from './repaint';

export let storage: Storage;
export let project: ProjectStorage;

/* Connects, and opens the project the visit remembers, or the one that was open last. False when there is none to open. */
export async function openStorage(): Promise<boolean> {
  storage = await connect();
  await Promise.all([storage.catalogue.load(), storage.catalogue.loadIcons(), storage.identity.load(), storage.projects.load()]);
  for (const id of new Set([visit.get('project'), storage.projects.lastOpenedId, ...storage.projects.list.map(p => p.id)])) {
    if (!id) continue;
    try { project = await storage.open(id); visit.set('project', id); return true; } catch (e) { if (!(e instanceof Refused)) throw e; }
  }
  return false;
}

/* shows why something was not done; a refusal that offers another step gets a button for it */
export function refused(e: unknown): void {
  const again = e instanceof Refused && e.actionMethod ? project.action(e.actionMethod) : null;
  if (again && e instanceof Refused) toast(e.message, e.actionLabel, () => { void act(again()).then(repaintEverything); });
  else toast(reason(e));
}

/* Carries out a command and shows the words it answers with. Gives the answer, or null when it was refused or the storage did not answer; the reason is shown then. */
export async function act<T extends Done>(command: Promise<T>): Promise<T | null> {
  try {
    const done = await command;
    if (done.message) toast(done.message);
    return done;
  } catch (e) { refused(e); return null; }
}
