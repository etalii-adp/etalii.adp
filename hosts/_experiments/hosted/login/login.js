/* The login page: any input signs in. */
'use strict';

$('#loginForm').addEventListener('submit',e=>{e.preventDefault();go('projects')});

pageReady();
