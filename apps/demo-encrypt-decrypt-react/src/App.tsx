import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { benchmark } from './utils';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { AuthSig } from '@lit-protocol/types';

function App() {

  // ----- autogen:app-name:start  -----
  const [appName, setAppName] = useState('Simple Encrypt Decrypt');
  // ----- autogen:app-name:end  -----

  const [npmRepo, setNpmRepo] = useState('https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-node-client');
  const [demoRepo, setDemoRepo] = useState('https://github.com/LIT-Protocol/js-sdk/tree/master/apps/demo-encrypt-decrypt-react');
  const [lang, setLang] = useState('json');
  const [data, setData] = useState<object | string>({
    data: {
      name: 'Lit Protocol',
      description: 'Threadshold cryptography for the win!',
    }
  });
  const [str, setStr] = useState('This test is working! Omg!');

  const go = async () => {
    let code = `import * as LitJsSdk from '@lit-protocol/lit-node-client';

const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: 'serrano',
});
await litNodeClient.connect();

// { ms } 
// { Loading... } 
const authSig = await LitJsSdk.checkAndSignAuthMessage({
  chain: 'ethereum'
});

const accs = [
  {
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
];

// { ms }
const res = await LitJsSdk.encryptString('${str}');

// { Loading... } 
const encryptedString = res.encryptedString;

// { Loading... } 
const symmetricKey = res.symmetricKey;

// { ms } 
// { Loading... } 
const base64EncryptedString = await LitJsSdk.blobToBase64String(
  encryptedString
);

// { ms } 
// { Loading... }
const encryptedSymmetricKey =
  await litNodeClient.saveEncryptionKey({
    accessControlConditions: accs,
    symmetricKey: symmetricKey,
    authSig: authSig,
    chain: 'ethereum',
  });

// { ms } 
// { Loading... }
const toDecrypt = await LitJsSdk.uint8arrayToString(
  encryptedSymmetricKey,
  'base16'
);

// { ms } 
// { Loading... }
const encryptionKey = await litNodeClient.getEncryptionKey({
  accessControlConditions: accs,
  toDecrypt: toDecrypt,
  authSig: authSig,
  chain: 'ethereum',
});

// { ms } 
// { Loading... }
const blob = LitJsSdk.base64StringToBlob(base64EncryptedString);

// { ms } 
// { Loading... }
const decryptedString = await LitJsSdk.decryptString(
  blob,
  encryptionKey
);

console.log("decryptedString:", "Loading...");

`;

    setLang('javascript')
    setData(code);

    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();


    // --------- NEXT STEP ---------
    let authSig: AuthSig

    await benchmark(async () => {
      authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
      return authSig
    }, (ms, res) => {
      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// { ${JSON.stringify(res)} }`);
      setData(code);
    });

    const accs = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ];


    // --------- NEXT STEP ---------
    let res;
    // @ts-ignore FIXME:
    let encryptedString;
    // @ts-ignore FIXME:
    let symmetricKey;

    await benchmark(async () => {
      res = await LitJsSdk.encryptString(str);
      return res
    }, (ms, res) => {
      encryptedString = res.encryptedString;
      symmetricKey = res.symmetricKey;


      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// [Blob] { ${JSON.stringify(encryptedString)} }`);
      code = code.replace('// { Loading... }', `// [Uint8Array] { ${JSON.stringify(symmetricKey)} }`);
      setData(code);
    });


    // --------- NEXT STEP ---------
    let base64EncryptedString: string;
    await benchmark(async () => {
      base64EncryptedString = await LitJsSdk.blobToBase64String(
        // @ts-ignore FIXME:
        encryptedString
      );
      return base64EncryptedString
    }, (ms, base64EncryptedString) => {

      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// [string] ${base64EncryptedString}`);
      // code = code.replace('// { Loading... }', `// [Uint8Array] { ${JSON.stringify(symmetricKey)} }`);
      setData(code);
    });


    // --------- NEXT STEP ---------
    let encryptedSymmetricKey: Uint8Array;
    await benchmark(async () => {
      encryptedSymmetricKey =
        await litNodeClient.saveEncryptionKey({
          accessControlConditions: accs,
          // @ts-ignore FIXME:
          symmetricKey,
          authSig: authSig,
          chain: 'ethereum',
        });
      return encryptedSymmetricKey
    }, (ms, encryptedSymmetricKey) => {

      console.log("encryptedSymmetricKey:", encryptedSymmetricKey)

      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// [Uint8Array] ${encryptedSymmetricKey}`);
      setData(code);
    });


    // --------- NEXT STEP ---------
    let toDecrypt: string;
    await benchmark(async () => {
      toDecrypt = LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        'base16'
      );
      return toDecrypt
    }, (ms, toDecrypt) => {

      console.log("toDecrypt:", toDecrypt)

      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// [string] ${toDecrypt}`);
      setData(code);
    });


    // --------- NEXT STEP ---------
    let encryptionKey: Uint8Array;

    await benchmark(async () => {
      encryptionKey = await litNodeClient.getEncryptionKey({
        accessControlConditions: accs,
        toDecrypt,
        authSig: authSig,
        chain: 'ethereum',
      });
      return encryptionKey
    }, (ms, encryptionKey) => {

      console.log("encryptionKey:", encryptionKey)

      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// [Uint8Array(32)] ${encryptionKey}`);
      setData(code);
    });


    // --------- NEXT STEP ---------
    let blob: Blob;
    await benchmark(async () => {
      blob = LitJsSdk.base64StringToBlob(base64EncryptedString);
      return blob
    }, (ms, blob) => {

      console.log("blob:", blob)

      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// ${blob}`);
      setData(code);
    });


    // --------- NEXT STEP ---------
    let decryptedString;

    await benchmark(async () => {
      decryptedString = await LitJsSdk.decryptString(
        blob,
        encryptionKey
      );
      return decryptedString;
    }, (ms, decryptedString) => {

      console.log("decryptedString:", decryptedString)

      code = code.replace('// { ms }', `// { ${ms} }`);
      code = code.replace('// { Loading... }', `// [string] ${decryptedString}`);
      code = code.replace('"Loading..."', `"${decryptedString}"`);
      setData(code);
    });



  }

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}<br />
          <span>
            <a target="_blank" href={npmRepo}>@lit-protocol/lit-node-client repo</a>&nbsp;|&nbsp;
            <a target="_blank" href={demoRepo}>demo repo</a>
          </span>
        </h4>
        <table>
          <tr>
            <td>
              <label>String</label>
            </td>

          </tr>
          <tr>
            <td>
              <input type="text" value={str} onChange={(newStr) => {
                setStr(newStr.target.value);
              }} />
            </td>

          </tr>
        </table>

        <button onClick={go}>Encrypt & Decrypt String!</button>
      </header>

      <div className='editor'>
        <Editor
          theme="vs-dark"
          height="100vh"
          language={lang}
          value={lang === 'json' ? JSON.stringify(data, null, 2) : `${data}`}
          options={{
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}


export default App;
