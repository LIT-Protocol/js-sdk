describe('All Specs', () => {

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

    it('should show all local constant modules', () => {
      cy.get('#constantsLocal').click();
      cy.get('#current-result').contains('ALL_LIT_CHAINS');
    })
    
    it('should show all dist constant modules', () => {
      cy.get('#constantsDist').click();
      cy.get('#current-result').contains('ALL_LIT_CHAINS');
    })
  
    it('should show all dist constant modules', () => {
      cy.get('#utilsLocal').click();
      cy.get('#current-result').contains('browser');
    })

    // ---------- eth.ts ----------  
    // it('should return correct wallet address', async () => {
    //   const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

    //   cy.acceptMetamaskAccess().should("be.true");

    //   expect(account).to.eq('0x352e559b06e9c6c72edbf5af2bf52c61f088db71');
    // })
    
    // it('metamask should request permission', async () => {
    //   window.ethereum.request({
    //       method: 'wallet_requestPermissions',
    //       params: [{ eth_accounts: {} }]
    //   }).then(() => {
    //     cy.acceptMetamaskAccess().should("be.true");
    //   });
    //   cy.wait(200)
    // })

    it('should run connectWeb3', () => {
      cy.get('#connectWeb3')
        .click()
        .get('#metamask')
        .click()
        .then(() => {
          cy.acceptMetamaskAccess()
          expect(localStorage.getItem('lit-web3-provider')).to.eq('metamask');
      })
    })

    it('disconnectWeb3 should remove all local storage items', () => {
      cy
        .get('#disconnectWeb3')
        .click()
        expect(localStorage.getItem('lit-web3-provider')).to.eq(null);
        expect(localStorage.getItem('lit-auth-cosmos-signature')).to.eq(null);
        expect(localStorage.getItem('lwalletconnect')).to.eq(null);
        expect(localStorage.getItem('lit-auth-signature')).to.eq(null);
        expect(localStorage.getItem('lit-auth-sol-signature')).to.eq(null);
    })

    it('checkAndSignEVMAuthMessage({chain: "ethereum", resources: [], switchChain: false})', () => {
      cy
        .get('#checkAndSignEVMAuthMessage')
        .click()
        .get('#metamask')
        .click().then(() => {
          cy.confirmMetamaskSignatureRequest().then(() => {
            expect(localStorage.getItem('lit-web3-provider')).to.eq('metamask');
          });          
        }).wait(200).then(() => {
          cy.confirmMetamaskSignatureRequest().then(() => {

            const itemKeypair = JSON.parse(localStorage.getItem('lit-comms-keypair'));
            const itemSig = JSON.parse(localStorage.getItem('lit-auth-signature'));

            expect(itemKeypair.publicKey).is.not.empty;
            expect(itemSig).is.not.empty;
          });          
        })

    })

    it('checkAndSignEVMAuthMessage({chain: "ethereum", resources: [], switchChain: true})', () => {
      cy
        .get('#checkAndSignEVMAuthMessage-switchChain')
        .click().then(() => {
          cy.get('#metamask').click().then(() => {
            cy.allowMetamaskToSwitchNetwork().then(() => {
              cy.confirmMetamaskSignatureRequest()
            });
          });
        })
    })

    // ---------- lit.ts ----------
    it('checkAndSignAuthMessage', () => {
      cy.get('#checkAndSignAuthMessage')
        .click().then(() => {
          cy.get('#metamask').click().then(() => {
            cy.confirmMetamaskSignatureRequest();
          });
        })
    })

  });
  