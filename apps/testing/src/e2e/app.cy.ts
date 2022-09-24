// @ts-nocheck

describe('example-nextjs-js', () => {

  before(() => {
    // cy.setupMetamask();
    // cy.changeMetamaskNetwork('localhost')
    cy.visit('/')
  });

  it(`NEXTJS setupMetamask should finish metamask setup using secret words`, () => {
    cy.setupMetamask(
      'shuffle stay hair student wagon senior problem drama parrot creek enact pluck',
      'goerli',
      'Tester@1234',
    ).then(setupFinished => {
      expect(setupFinished).to.be.true;
    });
  });

  // it('should test', async () => {
  //   // cy.get('#connectWeb3').click();
  //   // cy.wait(500)
  //   // cy.get('#metamask').click();
  //   // cy.wait(500)
  //   // cy.switchToMetamaskWindow();
  //   window.ethereum.request({
  //       method: 'wallet_requestPermissions',
  //       params: [{ eth_accounts: {} }]
  //   });

  //   // cy.wait(500)
  //   // cy.acceptMetamaskAccess().should("be.true");

  // })

  // it('should show all local constant modules', () => {
  //   cy.get('#constantsLocal').click();
  //   cy.get('#current-result').contains('ALL_LIT_CHAINS');
  //   cy.wait(200)
  // })
  
  // it('should show all dist constant modules', () => {
  //   cy.get('#constantsDist').click();
  //   cy.get('#current-result').contains('ALL_LIT_CHAINS');
  //   cy.wait(200)
  // })

  // it('should show all dist constant modules', () => {
  //   cy.get('#utilsLocal').click();
  //   cy.get('#current-result').contains('browser');
  //   cy.wait(200)
  // })

  // it('should run connectWeb3', () => {
  //   cy.get('#connectWeb3').click();
  //   cy.wait(500)
  //   cy.get('#metamask').click();
  //   cy.wait(200)
  //   // cy.get('@consoleLog').should('be.calledWith', 'Hello World!')
  // })

  // it('should return correct wallet address', async () => {
  //   const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
  //   expect(account).to.eq('0x8eea4fda67c24d8fee252442eb9a989deaf96485');
  //   cy.wait(200)
  // })
});
