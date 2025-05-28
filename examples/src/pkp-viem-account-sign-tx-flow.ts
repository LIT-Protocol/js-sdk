import { storagePlugins } from '@lit-protocol/auth';
import { init } from './init';
import { createWalletClient, http, parseEther, createPublicClient } from 'viem';

export const pkpSendTxFlow = async () => {
  const { myAccount, litClient, authManager } = await init();
  const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
  const authData = await ViemAccountAuthenticator.authenticate(myAccount);
  console.log('✅ authData:', authData);

  const { pkps } = await litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: 5,
    },
    storageProvider: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './pkp-tokens',
    }),
  });

  console.log('✅ pkps:', pkps);

  // select a PKP, choose the first one
  const selectedPkp = pkps[0];

  const authContext = await authManager.createEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: {
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
      ],
    },
    litClient,
  });

  console.log('---- PKP ACCOUNT -----');

  const pkpViemAccount = await litClient.getPkpViemAccount({
    pkpPublicKey: selectedPkp.publicKey,
    authContext,
    chainConfig: litClient.getChainConfig().viemConfig,
  });

  console.log('✅ pkpViemAccount:', pkpViemAccount);

  // ========================================
  //             Signing a message
  // ========================================
  // const signature = await pkpViemAccount.signMessage({
  //   message: 'hello',
  // });

  // console.log('🔥 signature:', signature);

  // ========================================
  //         Signing and Sending a tx
  // ========================================
  // 1. craft the tx object first
  const txRequest = {
    chainId: litClient.getChainConfig().viemConfig.id,
    to: pkpViemAccount.address,
    value: parseEther('0.001'),
  };

  // 2. sign the tx
  const signedTx = await pkpViemAccount.signTransaction(txRequest);

  // 3. send the tx via Viem WalletClient
  const pkpWalletClient = createWalletClient({
    account: pkpViemAccount,
    chain: litClient.getChainConfig().viemConfig,
    transport: http(litClient.getChainConfig().rpcUrl),
  });

  // 4. get the balance of the PKP
  const publicClient = createPublicClient({
    chain: litClient.getChainConfig().viemConfig,
    transport: http(litClient.getChainConfig().rpcUrl),
  });

  const pkpBalance = await publicClient.getBalance({
    address: pkpViemAccount.address,
  });

  console.log('PKP Address:', pkpViemAccount.address);
  console.log('💰 PKP Balance:', pkpBalance);

  // 5. send the tx via Viem WalletClient
  const sendTx = await pkpWalletClient.sendRawTransaction({
    serializedTransaction: signedTx,
  });

  console.log('🔥 sendTx:', sendTx);

  process.exit();
};

pkpSendTxFlow();
