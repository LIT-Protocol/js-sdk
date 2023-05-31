const readline = require('readline');
const LitJsSdk_pkpClient = require('@lit-protocol/pkp-client');
const LitJsSdk_pkpWalletconnect = require('@lit-protocol/pkp-walletconnect');

const CONTROLLER_AUTHSIG = {
  sig: '0x2b61d91d279bed9c1a161e27101698cdedd2c4c7a5cb7b60e3bd6fbcd6d1d305354918e1c01a8e61e1c7962b9cea213e3f17644957616dc160e49d945a864b4a1b',
  derivedVia: 'web3.eth.personal.sign',
  signedMessage:
    'localhost:4003 wants you to sign in with your Ethereum account:\n0x18f987D15a973776f6a60652B838688a1833fE95\n\n\nURI: http://localhost:4003/\nVersion: 1\nChain ID: 1\nNonce: ThH1ex9yv1tKz4TiO\nIssued At: 2023-04-28T13:30:44.477Z\nExpiration Time: 2034-09-24T04:30:44.452Z',
  address: '0x18f987d15a973776f6a60652b838688a1833fe95',
};

const PKP_PUBKEY =
  '049bc4a7b33316170694f6ca6d5917af9c4a492f91636b71105059e244f558b5a99c395001390f50c82aa8b44448984218a306951a30b0e57f133062dc9ceacefc';

// Set up PKP client
const pkpClient = new LitJsSdk_pkpClient.PKPClient({
  controllerAuthSig: CONTROLLER_AUTHSIG,
  pkpPubKey: PKP_PUBKEY,
  cosmosAddressPrefix: 'cosmos',
});

// Set up PKP WalletConnect
const pkpWalletConnect = new LitJsSdk_pkpWalletconnect.PKPWalletConnect();

// Read and write to stdin/stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  // Initialize PKPClient
  await pkpClient.connect();
  pkpWalletConnect.addPKPClient(pkpClient);

  // Initialize WalletConnect
  const config = {
    projectId: 'fcd184b860ea5998892e079adfbaf92f',
    metadata: {
      name: 'Test Wallet',
      description: 'Test Wallet',
      url: '#',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  };
  await pkpWalletConnect.initWalletConnect(config);
  // Get initailized SignClient
  const signClient = pkpWalletConnect.getSignClient();

  // Set up event listeners
  pkpWalletConnect.on('session_proposal', async (proposal) => {
    console.log('Received session proposal: ', proposal);

    // Accept session proposal
    await pkpWalletConnect.approveSessionProposal(proposal);

    // Print active sessions
    const sessions = Object.values(pkpWalletConnect.getActiveSessions());
    for (const session of sessions) {
      const { name, url } = session.peer.metadata;
      console.log(`Active Session: ${name} (${url})`);
    }
    console.log('\n' + '*'.repeat(50) + '\n');
  });

  pkpWalletConnect.on('session_request', async (requestEvent) => {
    console.log('Received session request: ', requestEvent);

    const { topic, params } = requestEvent;
    const { request } = params;
    const requestSession = signClient.session.get(topic);
    const { name, url } = requestSession.peer.metadata;

    // Accept session request
    console.log(
      `\nApproving ${request.method} request for session ${name} (${url})...\n`
    );
    await pkpWalletConnect.approveSessionRequest(requestEvent);
    console.log(
      `Check the ${name} dapp to confirm whether the request was approved`
    );
    console.log('\n' + '*'.repeat(50) + '\n');
  });

  signClient.on('session_delete', (event) => {
    // React to session delete event
    console.log(`Session deleted ${JSON.stringify(event)}`);
    console.log('\n' + '*'.repeat(50) + '\n');
  });

  // Connect to dapp
  rl.question('Connect to dapp: ', async (uri) => {
    // Pair using given URI
    console.log(`Received URI: ${uri}`);
    await pkpWalletConnect.pair({ uri: uri });
    // Print number of pairings
    console.log(
      `Number of pairings: ${
        pkpWalletConnect.getSignClient().core.pairing.pairings.values.length
      }`
    );
    console.log('\n' + '*'.repeat(50) + '\n');
    rl.close();
  });
}

main();
