// import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
// import LitConnectModal from 'lit-connect-modal';
// import { LIT_CHAINS } from '@lit-protocol/constants';
// import { EthereumProvider } from '@walletconnect/ethereum-provider';
// import { ethers } from 'ethers';

// export const connectWeb3 = async ({
//   chainId = 1,
// }) => {
//   const rpcUrls = getRPCUrls();

//   const wcProvider = await EthereumProvider.init({
//     projectId: 'eea2b5f47758cec790aeec609d7a9bbf',
//     chains: [chainId],
//     showQrModal: true,
//     optionalMethods: ['eth_sign']
//   });

//   // await wcProvider.connect();

//   let providerOptions = {
//     walletconnect: {
//       provider: wcProvider,
//       // options: {
//       //   projectId: '192bce9b7ee045b7dcc6892ced91eedf',
//       //   chains: [chainId],
//       //   showQrModal: true,
//       //   rpcMap: rpcUrls,
//       // },
//     },
//   };

//   // const provider = await EthereumProvider.init({
//   //   projectId: walletConnectProjectId,
//   //   chains: [chainId],
//   //   showQrModal: true,
//   // });

//   const dialog = new LitConnectModal({ providerOptions });

//   const provider = await dialog.getWalletProvider();

//   const web3 = new Web3Provider(provider);

//   // trigger metamask popup
//   try {
//     await provider.enable();
//   } catch (e) {
//     console.error(e);
//   }

//   const accounts = await web3.listAccounts();

//   const account = accounts[0].toLowerCase();

//   return { web3, account };
// };

// export const trigger = async ({ chain }) => {
//   const selectedChain = LIT_CHAINS[chain];
//   console.log('selectedChain', selectedChain);
  
//   const { web3, account } = await connectWeb3({
//     chainId: selectedChain.chainId,
//   });

//   const signer = web3.getSigner();
//   const messageBytes = ethers.utils.toUtf8Bytes('hello world');
  
//   if (signer instanceof JsonRpcSigner) {
//     try {
//       const signature = await signer.provider.send('personal_sign', [
//         ethers.utils.hexlify(messageBytes),
//         account.toLowerCase(),
//       ]);

//       const recoveredAddr = ethers.utils.verifyMessage('hello world', signature);

//       // Check if the address associated with the signature is the same as the current PKP
//       const verified =
//       account.toLowerCase() === recoveredAddr.toLowerCase();

//       console.log('verified', verified);

//     } catch (e) {
//       if (e.message.includes('personal_sign')) {
//         return await signer.signMessage(messageBytes);
//       }
//       throw e;
//     }
//   } else {
//     return await signer.signMessage(messageBytes);
//   }
// };

// const getRPCUrls = () => {
//   let rpcUrls = {};

//   const keys = Object.keys(LIT_CHAINS);

//   for (let i = 0; i < keys.length; i++) {
//     const chainName = keys[i];
//     const chainId = LIT_CHAINS[chainName].chainId;
//     const rpcUrl = LIT_CHAINS[chainName].rpcUrls[0];
//     rpcUrls[chainId] = rpcUrl;
//   }

//   return rpcUrls;
// };