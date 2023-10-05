// import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
// import * as LITCONFIG from '../../../../lit.config.json';
// import { ILitStorage, LitStorage } from '@lit-protocol/lit-storage';
// describe('getlitSDK', () => {
//   beforeAll(async () => {
//     try {
//       await loadLit();
//     } catch (e) {
//       console.log(
//         "You probably will need to run 'yarn build' before running this test.'"
//       );
//     }
//   });

//   describe('build', () => {
//     describe('default options', () => {
//       it('should build', async () => {
//         await globalThis.Lit.builder?.build();

//         // -- verify lit is ready
//         expect(globalThis.Lit.ready).toBe(true);
//       });

//       it('should emit "foo" event and return "bar"', async () => {
//         const mockFn = jest.fn();

//         if (!globalThis.Lit.eventEmitter) {
//           throw new Error('globalThis.Lit.eventEmitter is undefined!');
//         }

//         // -- start listening for "foo" event
//         globalThis.Lit.eventEmitter.on('foo', mockFn);

//         // -- now emit "foo" event, the mockFn should be called with "bar"
//         globalThis.Lit.eventEmitter.emit('foo', 'bar');

//         // -- verify mockFn was called with "bar"
//         expect(mockFn).toHaveBeenCalledWith('bar');
//       });
//     });

//     describe('with contract options', () => {
//       it('should build', async () => {
//         // -- config
//         globalThis.Lit.builder?.withContractOptions({
//           signer: new PKPEthersWallet({
//             pkpPubKey: LITCONFIG.PKP_PUBKEY,
//             rpc: LITCONFIG.CHRONICLE_RPC,
//             controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
//           }),
//         });

//         // -- build
//         await globalThis.Lit.builder?.build();

//         // -- verify option is set
//         // @ts-ignore
//         expect(globalThis.Lit.instance['_options'].signer._isSigner).toBe(true);
//       });
//     });
//   });

//   it('should emit ready event and configure custom option', async () => {
//     globalThis.Lit.eventEmitter?.on('ready', async () => {
//       globalThis.Lit.builder?.withContractOptions({
//         signer: new PKPEthersWallet({
//           pkpPubKey: LITCONFIG.PKP_PUBKEY,
//           rpc: LITCONFIG.CHRONICLE_RPC,
//           controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
//         }),
//       });
//       await globalThis.Lit.builder?.build();

//       expect(globalThis.Lit).toBeDefined();
//       expect(globalThis.Lit.instance).toBeDefined();
//       expect(
//         (globalThis.Lit.instance as any)['_options']?.signer
//       ).toBeDefined();
//       expect(globalThis.Lit.nodeClient).toBeDefined();
//     });
//   }, 10_000);

//   it('Should sign message', async () => {
//     const sig = await globalThis.Lit.sign({
//       accountPublicKey: LITCONFIG.PKP_PUBKEY,
//       content: 'Hello World',
//       authMaterial: LITCONFIG.CONTROLLER_AUTHSIG,
//     });
//     expect(sig).toBeDefined();
//   }, 10_000);

//   it('Should encrypt message and decrypt message as string', async () => {
//   globalThis.Lit.builder?.withCacheProvider(new LitStorage());
//     await globalThis.Lit.builder?.build();
//     const message: string = 'Hello World';
//     const enctyptedContent = await globalThis.Lit.encrypt({
//       accessControlConditions: [
//         {
//           conditionType: 'evmBasic',
//           contractAddress: '',
//           standardContractType: '',
//           chain: 'ethereum',
//           method: 'eth_getBalance',
//           parameters: [':userAddress', 'latest'],
//           returnValueTest: {
//             comparator: '>=',
//             value: '0',
//           },
//         },
//       ],
//       chain: 'ethereum',
//       content: message,
//     });

//     expect(enctyptedContent).toBeDefined();
//     expect(
//       globalThis.Lit.storage?.getItem(enctyptedContent.storageKey)
//     ).toBeDefined();
//     expect(
//       globalThis.Lit?.storage?.getItem(
//         enctyptedContent.storageKey
//       )
//     ).toBeDefined();

//     const res = await globalThis.Lit.decrypt({
//       storageContext: {
//         storageKey: enctyptedContent.storageKey,
//       },
//       decryptionContext: {
//         decryptionMaterial: enctyptedContent.decryptionContext.decryptionMaterial
//       },
//       authMaterial: LITCONFIG.CONTROLLER_AUTHSIG,
//     });

//     expect(typeof res.data).toBe('string');
//     expect(res.data).toEqual(message);
//   }, 100_000);
// });
