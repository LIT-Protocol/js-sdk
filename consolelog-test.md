# Browser Console Test

This file contains test cases that can be tested in the browser's console.

To start, run `node apps/html/server.js` and head over to http://127.0.0.1:4002/.

## Encrypt and decrypt file

```js
const state = {};
state.chain = 'ethereum';
state.litNodeClient = new LitJsSdk_litNodeClient.LitNodeClient({
  litNetwork: 'serrano',
});

await state.litNodeClient.connect();
state.file = new File(['Hello, world!'], 'hello.txt', {
  type: 'text/plain',
});

state.authSig = await LitJsSdk_authBrowser.checkAndSignAuthMessage({
  chain: state.chain,
});

state.accs = [
  {
    contractAddress: '',
    standardContractType: '',
    chain: state.chain,
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
];

state.encryptResponse = await LitJsSdk_encryption.zipAndEncryptFiles(
  [state.file],
  {
    accessControlConditions: state.accs,
    authSig: state.authSig,
    chain: state.chain,
  },
  state.litNodeClient,
);

state.decryptedFiles = await LitJsSdk_encryption.decryptToZip(
  {
    accessControlConditions: state.accs,
    authSig: state.authSig,
    chain: state.chain,
    ciphertext: state.encryptResponse.ciphertext,
    dataToEncryptHash: state.encryptResponse.dataToEncryptHash
  },
  state.litNodeClient,
);

console.warn('⬇️⬇️⬇️⬇️');
state;
```
