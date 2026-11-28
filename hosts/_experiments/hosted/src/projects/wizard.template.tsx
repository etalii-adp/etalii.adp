/* What the New Project wizard looks like: its frame, the list of its steps, and what each step asks. What a click or a key does is handed to it by wizard.ts. */
import type { ComponentChild, VNode } from 'preact';
import { ico } from '../common/icons.template';
import type { RecipeAreaInfo, RecipeInfo, SolutionSizeInfo, WizardQuestionInfo } from '../storage';

/* one line of the hierarchy a project would start with */
export interface Level { name: string; kind: string; icon: string; colour: string; children: Level[] }
/* an icon and the colour it is drawn in */
interface Drawn { icon: string; colour: string }

/* the form is the dialog itself; the typings of JSX give a form fewer roles than a page may use */
const dialog = 'dialog' as never;

export const many =(n: number, one: string, more = one + 's'): string => `${n} ${n === 1 ? one : more}`;

/* the steps at the side: the one the wizard is at, the ones that are done, and the ones that cannot be gone to yet */
const Steps = ({ labels, step, reached, sized, go }: { labels: readonly string[]; step: number; reached: number; sized: boolean; go: (step: number) => void }): VNode =>
  <>{labels.map((label, i) =>
    <li>
      <button type="button" class={'wz-step' + (i === step ? ' on' : '') + (i < step ? ' done' : '')} data-step={i} aria-current={i === step ? 'step' : undefined} disabled={i > reached || (i > 0 && !sized)} onClick={() => go(i)}>
        <span class="wz-n">{i < step ? ico('check') : i + 1}</span>{label}
      </button>
    </li>)}</>;

/* The wizard: the steps, the step it is at with what that step asks (body), and the way back and on. busy says a project is being made. */
export const Wizard = ({ labels, step, reached, sized, title, about, at, body, note, busy, on }: {
  labels: readonly string[]; step: number; reached: number; sized: boolean; title: string; about: string; at: string; body: ComponentChild; note: string; busy: boolean;
  on: { close: () => void; back: () => void; step: (step: number) => void; next: () => void };
}): VNode =>
  <div class="veil">
    <form class="wz" role={dialog} aria-modal="true" aria-labelledby="wz-t" novalidate onSubmit={e => { e.preventDefault(); on.next(); }}>
      <aside class="wz-steps"><h2>New Project</h2><ol><Steps labels={labels} step={step} reached={reached} sized={sized} go={on.step} /></ol></aside>
      <div class="wz-main">
        <header><h3 id="wz-t">{title}</h3><p>{about}</p></header>
        <div class="wz-body" data-at={at}>{body}</div>
        <footer>
          <span class="wz-note">{note}</span>
          <button type="button" class="btn" data-x="" onClick={on.close}>Cancel</button>
          <button type="button" class="btn" data-back="" hidden={step === 0} onClick={on.back}>Back</button>
          <button class="btn pri" data-next="" disabled={busy || !sized}>{step < labels.length - 1 ? 'Next' : busy ? 'Creating…' : 'Create Project'}</button>
        </footer>
      </div>
    </form>
  </div>;

const Box = ({ on }: { on: boolean }): VNode => <span class="wz-box">{on ? ico('check') : ''}</span>;

/* the kinds of solution, from the smallest to the largest; choose gets the one that was clicked and whether it was clicked a second time; press gets the one a key was pressed on, and says whether the key was meant for it */
export const Sizes = ({ sizes, sizeId, choose, press }: { sizes: readonly SolutionSizeInfo[]; sizeId: string; choose: (id: string, again: boolean) => void; press: (id: string, key: string) => boolean }): VNode =>
  <div class="wz-sizes" role="radiogroup" aria-label="Kind of solution">
    {sizes.map(s =>
      <button type="button" class={'wz-size' + (s.id === sizeId ? ' on' : '')} role="radio" aria-checked={s.id === sizeId} data-size={s.id}
        onClick={e => choose(s.id, e.detail > 1)} onKeyDown={e => { if (press(s.id, e.key)) e.preventDefault(); }}>
        <span class="wz-top">
          {ico(s.icon)}
          <span class="wz-scale" title={`Size ${s.scale} of ${sizes.length}`}>{sizes.map((_, i) => <i class={i < s.scale ? 'on' : undefined}></i>)}</span>
        </span>
        <b>{s.label}</b>
        <small>{s.about}</small>
        <span class="wz-parts">{s.parts.map(p => <span class="chip">{p}</span>)}</span>
      </button>)}
  </div>;

/* the questions of a step, each with the options that can be chosen together */
export const Questions = ({ asked, chosen, toggle }: { asked: readonly WizardQuestionInfo[]; chosen: ReadonlySet<string>; toggle: (optionId: string) => void }): VNode =>
  <>{asked.map(q =>
    <fieldset class="wz-q">
      <legend><b>{q.title}</b><small>{q.about}</small></legend>
      <div class="wz-opts">
        {q.options.map(o =>
          <button type="button" class={'wz-opt' + (chosen.has(o.id) ? ' on' : '')} role="checkbox" aria-checked={chosen.has(o.id)} data-opt={o.id} onClick={() => toggle(o.id)}>
            <Box on={chosen.has(o.id)} />
            <span><b>{o.label}</b><small>{o.about}</small></span>
          </button>)}
      </div>
    </fieldset>)}</>;

const Rows = ({ list, depth }: { list: readonly Level[]; depth: number }): VNode =>
  <>{list.map(x =>
    <>
      <div class="wz-row" style={`--d:${depth}`}>{ico(x.icon, 'c-' + x.colour)}<span>{x.name}</span></div>
      <Rows list={x.children} depth={depth + 1} />
    </>)}</>;

export const NoRecipes = (): VNode =>
  <div class="hint">No recipe fits these answers, so the hierarchy starts empty. Go back to choose more, or go on and add the first area in the Explorer.</div>;

/* the recipes that are offered, area by area, beside the hierarchy the ones that are kept make */
export const Recipes = ({ areas, offered, aside, kept, tree, name, root, brief, toggle, all }: {
  areas: readonly RecipeAreaInfo[]; offered: readonly RecipeInfo[]; aside: ReadonlySet<string>; kept: number; tree: readonly Level[];
  name: string; root: Drawn; brief: Drawn & { name: string }; toggle: (recipeId: string) => void; all: (kept: boolean) => void;
}): VNode =>
  <div class="wz-two">
    <div class="wz-recs">
      <div class="wz-all">
        <span>{many(kept, 'recipe')} of {offered.length}</span>
        <button type="button" data-all="1" onClick={() => all(true)}>Select all</button>
        <button type="button" data-all="" onClick={() => all(false)}>Select none</button>
      </div>
      {areas.map(a => {
        const mine = offered.filter(r => r.area === a.name);
        return mine.length ? <>
          <h4>{ico(a.icon)}{a.name}</h4>
          {mine.map(r => {
            const on = !aside.has(r.id);
            return <button type="button" class={'wz-rec' + (on ? ' on' : '')} role="checkbox" aria-checked={on} data-rec={r.id} onClick={() => toggle(r.id)}>
              <Box on={on} />
              <span><b>{r.name}</b><small>{r.about}</small></span>
              <span class="wz-count">{many(r.count, 'item')}</span>
            </button>;
          })}
        </> : '';
      })}
    </div>
    <div class="wz-tree" aria-label="The hierarchy the project starts with">
      <h4>Hierarchy</h4>
      <div class="wz-row root" style="--d:0">{ico(root.icon, 'c-' + root.colour)}<span>{name ? name : 'New project'}</span></div>
      <Rows list={tree} depth={1} />
      <div class="wz-row" style="--d:1">{ico(brief.icon, 'c-' + brief.colour)}<span>{brief.name}</span></div>
    </div>
  </div>;

/* the last step: the name, where the repository goes, and what the wizard was told; typed gets a field and what it holds now */
export const Naming = ({ name, path, branch, folder, refused, icon, summary, asked, typed }: {
  name: string; path: string; branch: string; folder: string; refused: string; icon: string; summary: string;
  asked: readonly (readonly [title: string, labels: readonly string[]])[]; typed: (field: 'name' | 'path' | 'branch', value: string) => void;
}): VNode =>
  <>
    <div class="wz-form">
      <label for="wz-name">Name</label>
      <input class="in" id="wz-name" maxlength={60} autocomplete="off" spellcheck={false} value={name} aria-invalid={refused ? 'true' : undefined} aria-describedby={refused ? 'wz-err' : undefined} onInput={e => typed('name', e.currentTarget.value)} />
      <p class="wz-err" id="wz-err" role="alert" hidden={!refused}>{refused}</p>
      <label for="wz-path">Location</label>
      <input class="in mono" id="wz-path" autocomplete="off" spellcheck={false} value={path} placeholder={folder} onInput={e => typed('path', e.currentTarget.value)} />
      <label for="wz-branch">Branch</label>
      <input class="in mono" id="wz-branch" autocomplete="off" spellcheck={false} value={branch} placeholder="main" onInput={e => typed('branch', e.currentTarget.value)} />
    </div>
    <div class="wz-sum">
      <h4>{ico(icon)}{summary}</h4>
      {asked.map(([title, labels]) => <div class="wz-ans"><span>{title}</span><span>{labels.map(l => <span class="chip">{l}</span>)}</span></div>)}
    </div>
  </>;
