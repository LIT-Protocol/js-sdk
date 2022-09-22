import { getGreeting } from '../support/app.po';
describe('example-nextjs-js', () => {

  before(() => {
    // cy.setupMetamask();
    // cy.changeMetamaskNetwork('localhost')
    cy.visit('/')
  });

  // it('should display welcome message', () => {

  //   // Custom command example, see `../support/commands.ts` file
  //   cy.login('my-email@something.com', 'myPassword');
  //   // Function helper example, see `../support/app.po.ts` file
  //   getGreeting().contains('Welcome example-nextjs-js');

  // });

  it('should show all local constant modules', () => {
    cy.get('#constantsLocal').click();
    cy.get('#current-result').contains('ALL_LIT_CHAINS');
    cy.wait(200)
  })
  
  it('should show all dist constant modules', () => {
    cy.get('#constantsDist').click();
    cy.get('#current-result').contains('ALL_LIT_CHAINS');
    cy.wait(200)
  })

  it('should show all dist constant modules', () => {
    cy.get('#utilsLocal').click();
    cy.get('#current-result').contains('browser');
    cy.wait(200)
  })

  it('should run connectWeb3', () => {
    cy.get('#connectWeb3').click();
    cy.wait(500)
    cy.get('#metamask').click();
    cy.wait(200)
    // cy.get('@consoleLog').should('be.calledWith', 'Hello World!')
  })

  it('should return correct wallet address', async () => {
    const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
    expect(account).to.eq('0x8eea4fda67c24d8fee252442eb9a989deaf96485');
    cy.wait(200)
  })
});
