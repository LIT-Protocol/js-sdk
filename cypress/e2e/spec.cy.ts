// @ts-nocheck

describe('User can load passge', () => {
  before(() => {
    // cy.setupMetamask();
    // cy.changeMetamaskNetwork('localhost')
    cy.visit('/', {
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
    // await window.LitJsSdk_authBrowser.checkAndSignAuthMessage({ chain: 'ethereum' })

    // cy.get('#metamask')
    // .click()
    // .then(() => {
    //   cy.acceptMetamaskAccess();
    //   expect(localStorage.getItem('lit-web3-provider')).to.eq('metamask');
    // });

    cy.window().then(async (window) => {
      window.params = 'true';
      console.log('window.params:', window.params);
      window.LitJsSdk_authBrowser.checkAndSignAuthMessage({ chain: 'ethereum' });
    });
  });

  it('click', () => {
    cy.get('#metamask').click().then(() => {
      cy.acceptMetamaskAccess().should("be.true").then();
    });
  })

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
