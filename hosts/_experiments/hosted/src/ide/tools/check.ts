/* Designer: test suites and validation procedures. */
import { $, esc } from '../../common/dom';
import { ico } from '../../common/icons';
import { act, project } from '../storage';
import type { CheckDocument } from '../types';
import { tbar, waiting, type Tool } from './shared';

export const rCheck: Tool = (d, x) => {
  const doc = project.content.doc<CheckDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  const R = doc?.rows ?? [], ok = R.filter(r => r[1] === 'Passed').length, col = x.kind === 'testsuite' ? 'Case' : x.kind === 'evalset' ? 'Scenario' : 'Rule or step';
  d.innerHTML = `<div class="tool">${tbar(x, `<span>${ok} of ${R.length} passed${doc?.lastRun ? ' · ' + esc(doc.lastRun) : ''}</span><span class="sp"></span><button class="btn" style="height:24px" id="c-run">${ico('play', 'c-green')}Run All</button>`)}<div class="scroll">${R.length ? `<table class="grid"><thead><tr><th>${col}</th><th>Result</th><th>Owner</th><th>Duration</th></tr></thead><tbody>${R.map((r, i) => `<tr><td>${esc(r[0])}</td><td><span class="pill ${r[1] === 'Passed' ? 'ok' : r[1] === 'Failed' ? 'bad' : 'wait'}">${r[1]}</span></td><td>${r[2] ? esc(r[2]) : '<span class="bad">No owner</span>'}</td><td class="wait">${r[1] === 'Not run' ? '' : (1.2 + i * .7).toFixed(1) + ' s'}</td></tr>`).join('')}</tbody></table>` : `<div class="hint">Nothing to check yet. Add the first ${col.toLowerCase()}.</div>`}</div></div>`;
  $('#c-run').onclick = () => { void act(project.status.run(x)); };
};
