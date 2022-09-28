// import { getGreeting } from '../support/app.po';
// @ts-nocheck
describe('example-nextjs-js', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', async () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    // getGreeting().contains('Welcome example-nextjs-js');

  
    // const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

    // console.log("account:", account)

    // console.log("cy:", cy);
    window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
  });

  // cy.wait(500)


    cy.testing().should("be.true");
    cy.acceptMetamaskAccess().should("be.true");

    // cy.assignWindows().should("be.true");

  });
});
