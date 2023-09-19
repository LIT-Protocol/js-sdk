import {
  JsonRpcProvider,
  testnetConnection,
  TransactionBlock,
} from '@mysten/sui.js';

import * as LITCONFIG from 'lit.config.json';

try {
  jest.setTimeout(60000);
  jest.useRealTimers();
} catch (e) {
  // swallow 
}

describe('PKPSuiWallet', () => {
  it('should create a wallet', async () => {
    const { PKPSuiWallet } = await import('./pkp-sui');
    const wallet = new PKPSuiWallet(
      {
        controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        pkpPubKey: LITCONFIG.PKP_PUBKEY,
      },
      new JsonRpcProvider(testnetConnection)
    );
    const address = await wallet.getAddress();
    expect(address).toEqual(LITCONFIG.PKP_SUI_ADDRESS);
  });

  it('should connects to lit node client', async () => {
    const { PKPSuiWallet } = await import('./pkp-sui');
    const wallet = new PKPSuiWallet(
      {
        controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        pkpPubKey: LITCONFIG.PKP_PUBKEY,
      },
      new JsonRpcProvider(testnetConnection)
    );
    await wallet.init();
    expect(wallet.litNodeClientReady).toEqual(true);
  });

  it('should retrieve account balance', async () => {
    const { PKPSuiWallet } = await import('./pkp-sui');
    const provider = new JsonRpcProvider(testnetConnection);
    const wallet = new PKPSuiWallet(
      {
        controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        pkpPubKey: LITCONFIG.PKP_PUBKEY,
      },
      provider
    );
    const address = await wallet.getAddress();
    const balance = await provider.getBalance({
      owner: address,
    });
    expect(parseInt(balance.totalBalance)).toBeGreaterThanOrEqual(1000);
  });

  it('should send a transaction to itself', async () => {
    const { PKPSuiWallet } = await import('./pkp-sui');
    const wallet = new PKPSuiWallet(
      {
        controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        pkpPubKey: LITCONFIG.PKP_PUBKEY,
      },
      new JsonRpcProvider(testnetConnection)
    );
    const address = await wallet.getAddress();
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000)]);
    tx.transferObjects([coin], tx.pure(address));

    const dryTransaction = await wallet.dryRunTransactionBlock({
      transactionBlock: tx,
    });

    expect(dryTransaction.effects.status.status).toEqual('success');

    // This will only send a transaction if the test flag is set to true
    if (LITCONFIG.test.sendRealTxThatCostsMoney) {
      const transaction = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      expect(transaction.digest).toBeDefined();
      // expect transaction.digest to be string of length 44
      expect(transaction.digest.length).toEqual(44);
    }

  }, 60000);
});
