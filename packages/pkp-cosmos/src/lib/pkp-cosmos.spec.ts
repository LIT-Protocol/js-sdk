import {
  SigningStargateClient,
  StdFee,
  calculateFee,
  GasPrice,
  coins,
} from '@cosmjs/stargate';

import * as LITCONFIG from 'lit.config.json';

jest.useRealTimers();

describe('PKPCosmosWallet', () => {
  it('should create a wallet', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.COSMOS_RPC,
      debug: true,
      addressPrefix: 'cosmos',
    });
    const [pkpAccount] = await wallet.getAccounts();
    expect(pkpAccount.address).toEqual(
      'cosmos134y3t6v0cfftzk4zhtzynqyyzj7dwwcz9chs0q'
    );
  });
  it('should connects to lit node client', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.COSMOS_RPC,
      debug: true,
      addressPrefix: 'cosmos',
    });
    await wallet.init();
    expect(wallet.litNodeClientReady).toEqual(true);
  });
  it('should retrieve account balance', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.COSMOS_RPC,
      debug: true,
      addressPrefix: 'cosmos',
    });
    const [pkpAccount] = await wallet.getAccounts();
    const rpcEndpoint = LITCONFIG.COSMOS_RPC;
    const client = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      wallet
    );
    const balances = await client.getAllBalances(pkpAccount.address);
    expect(parseInt(balances[0].amount)).toBeGreaterThan(1000);
  });

  it('should send a transaction to itself', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.COSMOS_RPC,
      debug: true,
      addressPrefix: 'cosmos',
    });
    const [pkpAccount] = await wallet.getAccounts();
    const amount = coins(LITCONFIG.AMOUNT, LITCONFIG.DENOM);
    const defaultGasPrice = GasPrice.fromString(
      `${LITCONFIG.DEFAULT_GAS}${LITCONFIG.DENOM}`
    );
    const defaultSendFee: StdFee = calculateFee(80_000, defaultGasPrice);
    console.log('sender', pkpAccount.address);
    console.log('transactionFee', defaultSendFee);
    console.log('amount', amount);
    const client = await SigningStargateClient.connectWithSigner(
      LITCONFIG.COSMOS_RPC,
      wallet
    );

    // This will only send a transaction if the test flag is set to true
    if (LITCONFIG.test.sendRealTxThatCostsMoney) {
      const transaction = await client.sendTokens(
        pkpAccount.address,
        pkpAccount.address,
        amount,
        defaultSendFee,
        'Transaction'
      );
      expect(transaction.transactionHash).toBeDefined();
      // expect transaction.transactionHash to be string of length 64
      expect(transaction.transactionHash.length).toEqual(64);
    }

    expect(client).toBeDefined();
  }, 60000);
});
