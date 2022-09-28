// @ts-nocheck

describe('example-nextjs-js', () => {
    
    before(() => {
        // cy.setupMetamask();
        // cy.changeMetamaskNetwork('localhost')
        cy.visit('/')
      });

    
    it(`setupMetamask should finish metamask setup using secret words`, () => {
        cy.setupMetamask(
        'shuffle stay hair student wagon senior problem drama parrot creek enact pluck',
        'goerli',
        'Tester@1234',
        ).then(setupFinished => {
        expect(setupFinished).to.be.true;
        });
    });

});
  