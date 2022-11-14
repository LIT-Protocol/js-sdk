// @ts-nocheck
// let savedData: any;
// import state from '../fixtures/state.json';

let savedParams: any;

describe('User can load passge', () => {
  // -- before
  before(() => {
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

  it('should check and sign auth message', async () => {
    const window = await cy.window();

    // cy.window().then(async (window) => {
    // -- set param
    window.params = { chain: 'ethereum' };

    savedParams = 456;

    // -- Click the event
    await cy.get('#LitJsSdk_authBrowser_checkAndSignAuthMessage').click()
    // await cy.wait(100);
    await cy.get('#metamask').click();
    // await cy.wait(100);
    const confirmed = await cy.confirmMetamaskSignatureRequest();
    await cy.wait(100);
    await cy.confirmMetamaskSignatureRequest();
    await cy.wait(100).then(() => {
      savedParams = JSON.parse(window.output);

      // expect it to be an object
      expect(savedParams).to.be.an('object');
      
      // expect output not empty
      // expect(window.output).to.not.be.empty;
      // expect(window.output).to.eq(1);
    });
    // await cy.confirmMetamaskSignatureRequest()
    //   .get('#metamask')
    //   .click()
    //   .wait(100)
    //   .confirmMetamaskSignatureRequest()
    //   .wait(100)
    //   // Buffer not defined so have to sign again
    //   .confirmMetamaskSignatureRequest()
    //   .wait(100)
    //   .then(() => {
    //     // expect object to have key authSig
    //     OUTPUT = window.output;
    //     expect(JSON.parse(window.output)).to.have.property('sig');
    //   });
  });

  it('encrypt and decrypt string', async () => {

    expect(savedParams).to.equal(123);
      // -- Click the event
    // await cy.get('#LitJsSdk_litNodeClient_checkAndSignAuthMessage').click();

    // await cy.get('#metamask').click();
    // await cy.wait(100);
    // await cy.confirmMetamaskSignatureRequest().wait(100);
    // // Buffer not defined so have to sign again
    // await cy
    //   .confirmMetamaskSignatureRequest()
    //   .wait(100)
    //   .should(async () => {
    //     const authSig = window.output;
    //     const LitJsSdk = window.LitJsSdk_litNodeClient;

    //     const { encryptedString, symmetricKey } =
    //       await LitJsSdk.encryptString('Hello World!');

    //     expect(encryptedString).to.be.a('Blob');
    //     expect(symmetricKey).to.be.a('Uint8Array');

    //     const base64 = await LitJsSdk.blobToBase64String(encryptedString);
    //     expect(base64).to.be.a('string');

      });
  // });
});
