import {
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  StdFee,
  calculateFee,
  GasPrice,
  coins,
} from '@cosmjs/stargate';

const CONFIG = {
  MNEUMONIC:
    'island arrow object divide umbrella snap essay seminar top develop oyster success',
  RPC_ENDPOINT: 'https://cosmos-mainnet-rpc.allthatnode.com:26657',
  RECIPIENT: 'cosmos1jyz3m6gxuwceq63e44fqpgyw2504ux85ta8vma',
  DENOM: 'uatom',
  AMOUNT: 0,
  DEFAULT_GAS: 0, // 0.025
  CONTROLLER_AUTHSIG: {
    sig: '0x7dd45119cb1fde7fb0b891d3de7262e5d564e64ec46b873163a373a4645626a328bceb089209ac68bdd429185a30f32e7bbf2eb71820c94c5f0547716526884c1c',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage:
      'localhost:1209 wants you to sign in with your Ethereum account:\n0x18f987D15a973776f6a60652B838688a1833fE95\n\n\nURI: http://localhost:1209/auth\nVersion: 1\nChain ID: 1\nNonce: 1IbQokxUmJZ1opsTY\nIssued At: 2023-03-20T15:40:48.024Z\nExpiration Time: 2023-03-27T15:40:48.010Z',
    address: '0x18f987d15a973776f6a60652b838688a1833fe95',
  },
  PKP_PUBKEY:
    '0x04cd5fc4b661a2ae2dc425aa42abbfeaa187c07063928322a8c748ebb7611868144c0ff28b1910faeafedea914ec8a23baa579b6ff7f03efa322e7eb098e62dd8f',
};

describe('PKPCosmosWallet', () => {
  it('should create a wallet', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos-wallet');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: CONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: CONFIG.PKP_PUBKEY,
      rpc: CONFIG.RPC_ENDPOINT,
      debug: true,
      addressPrefix: 'cosmos',
    });

    const [pkpAccount] = await wallet.getAccounts();

    expect(pkpAccount.address).toEqual(
      'cosmos134y3t6v0cfftzk4zhtzynqyyzj7dwwcz9chs0q'
    );
  });

  it('should connects to lit node client', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos-wallet');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: CONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: CONFIG.PKP_PUBKEY,
      rpc: CONFIG.RPC_ENDPOINT,
      debug: true,
      addressPrefix: 'cosmos',
    });

    await wallet.init();

    expect(wallet.litNodeClientReady).toEqual(true);
  });

  it('should retrieve account balance', async () => {
    const { PKPCosmosWallet } = await import('./pkp-cosmos-wallet');
    const wallet = new PKPCosmosWallet({
      controllerAuthSig: CONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: CONFIG.PKP_PUBKEY,
      rpc: CONFIG.RPC_ENDPOINT,
      debug: true,
      addressPrefix: 'cosmos',
    });

    const [pkpAccount] = await wallet.getAccounts();

    const rpcEndpoint = CONFIG.RPC_ENDPOINT;
    const client = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      wallet
    );

    const balances = await client.getAllBalances(pkpAccount.address);

    expect(balances[0].amount).toEqual('1230');
  });

  // it('should send a transaction to itself', async () => {
  //   const { PKPCosmosWallet } = await import('./pkp-cosmos-wallet');
  //   const wallet = new PKPCosmosWallet({
  //     controllerAuthSig: CONFIG.CONTROLLER_AUTHSIG,
  //     pkpPubKey: CONFIG.PKP_PUBKEY,
  //     rpc: CONFIG.RPC_ENDPOINT,
  //     debug: true,
  //     addressPrefix: 'cosmos',
  //   });

  //   const [pkpAccount] = await wallet.getAccounts();
  //   const amount = coins(CONFIG.AMOUNT, CONFIG.DENOM);
  //   const defaultGasPrice = GasPrice.fromString(
  //     `${CONFIG.DEFAULT_GAS}${CONFIG.DENOM}`
  //   );
  //   const defaultSendFee: StdFee = calculateFee(80_000, defaultGasPrice);

  //   console.log('sender', pkpAccount.address);
  //   console.log('transactionFee', defaultSendFee);
  //   console.log('amount', amount);

  //   const client = await SigningStargateClient.connectWithSigner(
  //     CONFIG.RPC_ENDPOINT,
  //     wallet
  //   );

  //   client.getTx()

  //   const transaction = await client.sendTokens(
  //     pkpAccount.address,
  //     pkpAccount.address,
  //     amount,
  //     defaultSendFee,
  //     'Transaction'
  //   );

  //   expect(transaction).toEqual(0);
  // });
});
