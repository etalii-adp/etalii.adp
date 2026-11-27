/* The login page: any input signs in. */
import { $ } from '../common/dom';
import { go, pageReady } from '../common/nav';
import { startPage } from '../common/page';

startPage();
$('#loginForm').addEventListener('submit', e => { e.preventDefault(); go('projects'); });
pageReady();
