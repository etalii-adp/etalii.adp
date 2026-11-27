/* The login page. An email with the password signs in. Single sign-on and a git provider are asked as well, and both answer that the workspace has not set them up, so neither leads to the projects. */
import { $, $$, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { go, pageReady } from '../common/nav';
import { startPage } from '../common/page';

startPage();

/* the password every user of the workspace has */
const PASSWORD = '42!';
const PROVIDERS = ['GitHub', 'GitLab', 'Bitbucket', 'Azure DevOps'];
/* how long an identity provider or a git provider takes to answer */
const ANSWER_MS = 900;

const field = (selector: string): HTMLInputElement => $<HTMLInputElement>(selector);
const workspace = (): string => field('#lg-ws').value.trim() || 'this workspace';

/* what a step answers; kind says whether it is waiting or refusing */
function say(msg: HTMLElement, text: string, kind: '' | 'wait' | 'bad' = ''): void {
  msg.textContent = text;
  msg.classList.toggle('wait', kind === 'wait');
  msg.classList.toggle('bad', kind === 'bad');
  msg.hidden = !text;
}

/* the question that is out; an answer to an earlier one, or to a step that was left, is dropped */
let asked = 0;
/* asks, and gives the answer after a moment unless something else was asked in between */
function ask(msg: HTMLElement, waiting: string, answer: string, busy: HTMLButtonElement[]): void {
  const mine = ++asked;
  say(msg, waiting, 'wait');
  busy.forEach(b => { b.disabled = true; });
  setTimeout(() => {
    busy.forEach(b => { b.disabled = false; });
    if (mine === asked) say(msg, answer);
  }, ANSWER_MS);
}

/* shows one step of the panel: the sign-in form, single sign-on, or the git providers */
function show(id: string): void {
  asked++;
  $$('.lg-step').forEach(step => { step.hidden = step.id !== id; });
  $$('.lg-msg').forEach(msg => say(msg, ''));
  field('#lg-pw').classList.remove('bad');
  if (id === 'ssoForm') field('#sso-ws').value = field('#lg-ws').value;
  $<HTMLElement>(`#${id} input, #${id} button`).focus();
}

/* email and password */
const password = field('#lg-pw'), refused = $('#lg-err');
$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  if (password.value === PASSWORD) { go('projects'); return; }
  say(refused, password.value ? 'The email or the password is not right.' : 'Enter your password.', 'bad');
  password.classList.add('bad');
  password.focus();
  password.select();
});
password.addEventListener('input', () => { say(refused, ''); password.classList.remove('bad'); });

/* single sign-on: the workspace is asked for its identity provider, and has none */
$('#ssoForm').addEventListener('submit', e => {
  e.preventDefault();
  const ws = field('#sso-ws').value.trim(), msg = $('#sso-msg');
  if (!ws) { say(msg, 'Enter the workspace you sign in to.', 'bad'); return; }
  ask(msg, `Asking ${ws} for its identity provider…`, `Single sign-on is not set up for ${ws}. A workspace administrator can connect an identity provider. Until then, sign in with your email and password.`, [$<HTMLButtonElement>('#ssoForm [type=submit]')]);
});

/* a git provider: it confirms who you are, and the workspace knows no user with that account */
const providers = $('#git-providers');
providers.innerHTML = PROVIDERS.map(name => `<button class="btn" type="button" data-provider="${esc(name)}">${ico('branch', 'c-muted')}${esc(name)}</button>`).join('');
providers.addEventListener('click', e => {
  const name = hit(e, '[data-provider]')?.dataset.provider;
  if (!name) return;
  ask($('#git-msg'), `Waiting for ${name} to confirm who you are…`, `No user of ${workspace()} is linked to this ${name} account. Sign in with your email and password, then link the account in your account settings.`, $$<HTMLButtonElement>('button', providers));
});

document.addEventListener('click', e => { const to = hit(e, '[data-step]'); if (to) show(to.dataset.step!); });

pageReady();
