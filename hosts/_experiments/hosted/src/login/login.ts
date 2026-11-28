/* The login page. An email with the password signs in. Single sign-on and a git provider are asked as well; the identity store says what each of them answers. */
import { h } from 'preact';
import { $, $$, draw, hit } from '../common/dom';
import { go, pageReady } from '../common/nav';
import { startStored } from '../common/away';
import { startPage } from '../common/page';
import { reason } from '../common/reason';
import { connect } from '../storage';
import { Providers } from './login.tsx';

const field = (selector: string): HTMLInputElement => $<HTMLInputElement>(selector);

/* what a step answers; kind says whether it is waiting or refusing */
function say(msg: HTMLElement, text: string, kind: '' | 'wait' | 'bad' = ''): void {
  msg.textContent = text;
  msg.classList.toggle('wait', kind === 'wait');
  msg.classList.toggle('bad', kind === 'bad');
  msg.hidden = !text;
}

async function start(): Promise<void> {
  startPage();
  const { identity } = await connect();
  await identity.load();
  /* as what the form starts with, so a reset of the form brings them back */
  field('#lg-ws').defaultValue = identity.workspace;
  field('#lg-email').defaultValue = identity.user.email;
  const workspace = (): string => field('#lg-ws').value.trim();

  /* the question that is out; an answer to an earlier one, or to a step that was left, is dropped */
  let asked = 0;
  /* asks, and shows the answer unless something else was asked in between */
  function ask(msg: HTMLElement, waiting: string, signedIn: Promise<void>, busy: HTMLButtonElement[]): void {
    const mine = ++asked;
    say(msg, waiting, 'wait');
    busy.forEach(b => { b.disabled = true; });
    signedIn.then(() => { if (mine === asked) go('projects'); }, (e: unknown) => { if (mine === asked) say(msg, reason(e)); }).finally(() => busy.forEach(b => { b.disabled = false; }));
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
  const refuse = (why: string): void => { say(refused, why, 'bad'); password.classList.add('bad'); password.focus(); password.select(); };
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!password.value) { refuse('Enter your password.'); return; }
    identity.signIn(workspace(), field('#lg-email').value.trim(), password.value, field('#lg-keep').checked).then(() => go('projects'), (err: unknown) => refuse(reason(err)));
  });
  password.addEventListener('input', () => { say(refused, ''); password.classList.remove('bad'); });

  /* single sign-on: the workspace is asked for its identity provider */
  $('#ssoForm').addEventListener('submit', e => {
    e.preventDefault();
    const ws = field('#sso-ws').value.trim(), msg = $('#sso-msg');
    if (!ws) { say(msg, 'Enter the workspace you sign in to.', 'bad'); return; }
    ask(msg, `Asking ${ws} for its identity provider…`, identity.singleSignOn(ws), [$<HTMLButtonElement>('#ssoForm [type=submit]')]);
  });

  /* a git provider confirms who you are */
  const providers = $('#git-providers');
  draw(providers, h(Providers, { names: identity.providers, choose: name => ask($('#git-msg'), `Waiting for ${name} to confirm who you are…`, identity.providerSignIn(workspace(), name), $$<HTMLButtonElement>('button', providers)) }));

  document.addEventListener('click', e => { const to = hit(e, '[data-step]'); if (to) show(to.dataset.step!); });
  pageReady();
}

startStored(start);
