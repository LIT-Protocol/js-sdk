// @ts-nocheck

describe('User can load passge', () => {
  before(() => {
    // cy.setupMetamask();
    // cy.changeMetamaskNetwork('localhost')
    cy.visit('http://localhost:4003/', {
      onBeforeLoad(win) {
        win.disableIntercom = true;
      },
    });
    cy.setupMetamask(
      'shuffle stay hair student wagon senior problem drama parrot creek enact pluck',
      'goerli',
      'Testing!23'
    );
  });

  // it(`setupMetamask should finish metamask setup using secret words`, () => {
  //   cy.setupMetamask(
  //     'shuffle stay hair student wagon senior problem drama parrot creek enact pluck',
  //     'goerli',
  //     'Testing!23',
  //   ).then(setupFinished => {
  //     expect(setupFinished).to.be.true;
  //   });
  // });

  it('is expected to display a sussess message', async () => {

    cy.window().then(async (window) => {

      // -- set param
      window.params = { chain: 'ethereum' };

      cy.get('#LitJsSdk_authBrowser_checkAndSignAuthMessage')
        .click().then(() => {
          cy.get('#metamask').click().then(() => {
            cy.confirmMetamaskSignatureRequest().then(() => {
              console.log("Done!");
            })
          })
        });
    });
  });

  // it('click', () => {
  //   cy.get('#metamask').click().then(() => {
  //     cy.acceptMetamaskAccess().should("be.true").then();
  //   });
  // })

  // it('is expected to display the local wallet address', () => {
  //   cy.get('[data-cy=address').should('contain.text', 'Your address is: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
  // });

  // it('is expected to display the local wallet  balance', () => {
  //   cy.get('[data-cy=balance').should('contain.text', 'Balance: 10000000000000000000000')
  // });

  // it('exp', () => {
  //   cy.get('[data-cy=exp]').should('contain.text', 'exp')
  // })
});
