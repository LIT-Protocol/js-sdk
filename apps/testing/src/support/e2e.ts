// @ts-nocheck
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import { configure } from '@testing-library/cypress';

configure({ testIdAttribute: 'data-testid' });

// dont fail tests on uncaught exceptions of websites
Cypress.on('uncaught:exception', () => {
  if (!process.env.FAIL_ON_ERROR) {
    return false;
  }
});

Cypress.on('window:before:load', win => {
  cy.stub(win.console, 'error').callsFake(message => {
    cy.now('task', 'error', message);
    // fail test on browser console error
    if (process.env.FAIL_ON_ERROR) {
      throw new Error(message);
    }
  });

  cy.stub(win.console, 'warn').callsFake(message => {
    cy.now('task', 'warn', message);
  });
});

// before(() => {
//   if (!Cypress.env('SKIP_METAMASK_SETUP')) {
//     cy.setupMetamask();
//   }
// });

// before(async () => {
//   if (!Cypress.env('SKIP_METAMASK_SETUP')) {
//     await cy.setupMetamask();
//   }
// });
// before(() => {
//     window.ethereum.request({
//         method: 'wallet_requestPermissions',
//         params: [{ eth_accounts: {} }]
//     });
// })

// console.log("cy:", cy);

// cy.acceptMetamaskAccess().should("be.true");
