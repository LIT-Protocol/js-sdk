# This file contains test cases that can be tested in the browser's console

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

state.zipFiles = await LitJsSdk_encryption.zipAndEncryptFiles([state.file]);
state.encryptedZipBase64 = await LitJsSdk_miscBrowser.blobToBase64String(
  state.zipFiles.encryptedZip
);

state.encryptedSymmetricKey = await state.litNodeClient.saveEncryptionKey({
  accessControlConditions: state.accs,
  symmetricKey: state.zipFiles.symmetricKey,
  authSig: state.authSig,
  chain: state.chain,
});

state.toDecrypt = await LitJsSdk_uint8arrays.uint8arrayToString(
  state.encryptedSymmetricKey,
  'base16'
);

state.encryptionKey = await state.litNodeClient.getEncryptionKey({
  accessControlConditions: state.accs,
  toDecrypt: state.toDecrypt,
  authSig: state.authSig,
  chain: 'etheruem',
});

state.decryptFileBlob = LitJsSdk_miscBrowser.base64StringToBlob(
  state.encryptedZipBase64
);

state.decryptedZip = await LitJsSdk_encryption.decryptFile({
  file: state.decryptFileBlob,
  symmetricKey: state.encryptionKey,
});

state.decryptedFile = await LitJsSdk_uint8arrays.uint8arrayToString(
  state.decryptedZip
);

console.warn('⬇️⬇️⬇️⬇️');
state;
```
