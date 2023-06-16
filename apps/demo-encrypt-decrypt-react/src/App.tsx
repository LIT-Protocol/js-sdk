import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { benchmark } from './utils';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

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
  const [str, setStr] = useState(toHexString('This test is working! Omg!'));

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
const res = await LitJsSdk.encryptString({
  accessControlConditions: accs,
  authSig,
  chain: 'ethereum',
  dataToEncrypt: '${str}',
}, litNodeClient);

// { Loading... } 
const ciphertext = res.ciphertext;

// { Loading... } 
const dataToEncryptHash = res.dataToEncryptHash;

// { ms } 
// { Loading... }
const decryptedString = await litNodeClient.decryptToString({
  accessControlConditions: accs,
  toDecrypt: toDecrypt,
  authSig: authSig,
  chain: 'ethereum',
});

console.log("decryptedString:", "Loading...");

`;

    setLang('javascript')
    setData(code);

    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();


    // --------- NEXT STEP ---------
    const authRes = await benchmark(async () => {
      return LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
    });
    code = code.replace('// { ms }', `// { ${authRes.duration} }`);
    code = code.replace('// { Loading... }', `// { ${JSON.stringify(authRes.result)} }`);
    setData(code);

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

    console.log("NETWORK PUB KEY:", litNodeClient.networkPubKey);


    // --------- NEXT STEP ---------
    console.log("str:", str)
    const encryptRes = await benchmark(async () => {
      return LitJsSdk.encryptString({
        accessControlConditions: accs,
        authSig: authRes.result,
        chain: 'ethereum',
        dataToEncrypt: str,
      }, litNodeClient);
    });

    code = code.replace('// { ms }', `// { ${encryptRes.duration} }`);
    code = code.replace('// { Loading... }', `// [string] { ${encryptRes.result.ciphertext} }`);
    code = code.replace('// { Loading... }', `// [Uint8Array] { ${JSON.stringify(encryptRes.result.dataToEncryptHash)} }`);
    setData(code);

    // --------- NEXT STEP ---------
    const decryptRes = await benchmark(async () => {
      return LitJsSdk.decryptToString({
        accessControlConditions: accs,
        ciphertext: encryptRes.result.ciphertext,
        dataToEncryptHash: encryptRes.result.dataToEncryptHash,
        authSig: authRes.result,
        chain: 'ethereum',
      }, litNodeClient);
    })

    code = code.replace('// { ms }', `// { ${decryptRes.duration} }`);
    code = code.replace('// { Loading... }', `// [string] ${decryptRes.result}`);
    code = code.replace('"Loading..."', `"${decryptRes.result}"`);
    setData(code);
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

// Function to convert utf-8 string into hex string.
function toHexString(str: string) {
  var hex = '';
  for (var i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return '0x' + hex;
}
