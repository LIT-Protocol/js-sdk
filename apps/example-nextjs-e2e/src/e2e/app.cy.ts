describe('..-apps-example-nextjs', () => {
  
  beforeEach(() => cy.visit('/', {
    onBeforeLoad(win) {
      cy.stub(win.console, 'log').as('consoleLog')
    },
  }));

  it('should run the Util function @litprotocol-dev/utils package', () => {
    cy.get('#utils-function').click();
    cy.get('@consoleLog').should('be.calledWith', '[utils] has been called')
  })
});
