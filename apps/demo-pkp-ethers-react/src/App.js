import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { benchmark } from './utils';
import { PKPWallet } from '@lit-protocol/pkp-ethers.js';
import { ethers } from "ethers";

function App() {

  // ----- autogen:app-name:start  -----
  const [appName, setAppName] = useState('@lit-protocol/pkp-ethers.js');
  // ----- autogen:app-name:end  -----

  const [npmRepo, setNpmRepo] = useState('https://www.npmjs.com/package/@lit-protocol/pkp-ethers.js');
  const [demoRepo, setDemoRepo] = useState('');
  const [lang, setLang] = useState('json');
  const [data, setData] = useState({
    data: {
      name: 'Lit Protocol',
      description: 'Threadshold cryptography for the win!',
    }
  });

  const ADDRESS = '0x5B8A8d043f2235a29E4b063c20299050931832Dc';
  const [pkpPubKey, setPkpPubKey] = useState('0x0439e24fbe3332dd2abe3073f663a58fc74674095e5834ebbe7a86fd52f1cbe54b8268d6426fbd66a6979d787b6848b750f3a64a6354da4616f93a3031f3d44e95');

  const [controllerAuthSig, setControllerAuthSig] = useState({ "sig": "0x8c4b3b2a2f8f0b33ad8092719a604e94ffd2d938c115741e7155cdea3653fca75285ed2499ec1c6f60ab4b1e5e9fab2d4e6cf36abf32fe515d67de152736dfcd1b", "derivedVia": "web3.eth.personal.sign", "signedMessage": "localhost:3000 wants you to sign in with your Ethereum account:\n0x5B8A8d043f2235a29E4b063c20299050931832Dc\n\n\nURI: http://localhost:3000/\nVersion: 1\nChain ID: 80001\nNonce: McW3494o8EuALAzJn\nIssued At: 2022-12-06T18:09:09.646Z\nExpiration Time: 2022-12-13T18:09:09.644Z", "address": "0x5B8A8d043f2235a29E4b063c20299050931832Dc" });

  const [pkpWallet, setPkpWallet] = useState();

  const signMessage = async () => {

    if (!pkpWallet) {
      setLang('javascript');
      setData("// PKP Wallet not initialized. ");
      return;
    }
    let code = `const msg = "Secret Message.. shh!";

// { ms }
// { Loading... }
const signedMsg = await pkpWallet.signMessage(msg);

// { ms }
// { Loading... }
const signMsgAddr = await pkpWallet.verifyMessage(msg, signedMsg);

// { ms }
// { Loading... }
const verified = signMsgAddr.toLowerCase() === (await pkpWallet.getAddress()).toLowerCase();
`;
    const msg = "Secret Message.. shh!";

    await benchmark(async () => {
      const signedMsg = await pkpWallet.signMessage(msg);

      return signedMsg;
    }, async (ms, signedMsg) => {
      code = code.replace('{ ms }', `[${ms}]`);
      code = code.replace('{ Loading... }', `signedMsg: ${signedMsg}`)
      setData(code);

      await benchmark(async () => {
        const signMsgAddr = ethers.utils.verifyMessage(msg, signedMsg);

        return signMsgAddr;
      }, async (ms, signMsgAddr) => {
        code = code.replace('{ ms }', `[${ms}]`);
        code = code.replace('{ Loading... }', `signedMsg: ${signMsgAddr}`)
        setData(code);

        await benchmark(async () => {
          const signerAddress = signMsgAddr.toLowerCase();
          const pkpWalletAddress = (await pkpWallet.getAddress()).toLowerCase();
          const verified = signerAddress === pkpWalletAddress;
          return { verified, signerAddress, pkpWalletAddress };

        }, async (ms, data) => {
          code = code.replace('{ ms }', `[${ms}]`);
          code = code.replace('{ Loading... }', `
// signerAddress: ${data.signerAddress}
// pkpWalletAddress: ${data.pkpWalletAddress}
// verified: ${data.verified}`)
          setData(code);
        });

      });
    });
  }

  const go = async () => {

    let code = `const PKP_PUBKEY = '${pkpPubKey}';
const CONTROLLER_AUTHSIG = ${JSON.stringify(controllerAuthSig)}

const _pkpWallet = new PKPWallet({
  pkpPubKey: PKP_PUBKEY,
  controllerAuthSig: CONTROLLER_AUTHSIG,
  provider: "https://rpc-mumbai.maticvigil.com",
});

// { ms }
await _pkpWallet.init();

{ Loading... }`;

    const _pkpWallet = new PKPWallet({
      pkpPubKey: pkpPubKey,
      controllerAuthSig: controllerAuthSig,
      provider: "https://rpc-mumbai.maticvigil.com",
    });

    await _pkpWallet.init();

    setLang('javascript');

    await benchmark(async () => {
      await _pkpWallet.init();
      return _pkpWallet;
    }, (ms, _pkpWallet) => {
      code = code.replace('{ Loading... }', '// OUTPUT:\nconst output = ' + JSON.stringify(_pkpWallet, null, 2));
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
      setPkpWallet(_pkpWallet);
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}<br />
          <span>
            <a target="_blank" href={npmRepo}>npm repo</a>&nbsp;|&nbsp;
            <a target="_blank" href={demoRepo}>demo repo</a>
          </span>
        </h4>
        <table>
          <tr>
            <td>
              <label>PKP Public Key</label>
            </td>
            <td>
              <label>Controller Auth Sig</label>
            </td>
          </tr>
          <tr>
            <td>
              <input type="text" value={pkpPubKey} onChange={e => setPkpPubKey(e.target.value)} />
            </td>
            <td>
              <input type="text" value={JSON.stringify(controllerAuthSig)} onChange={e => setControllerAuthSig(JSON.parse(e.target.value))} />
            </td>
          </tr>
        </table>
        <button onClick={go}>Create PKP Wallet instance</button>
        <button onClick={signMessage}>Sign Message</button>
      </header>

      <div className='editor'>
        <Editor
          theme="vs-dark"
          height="100vh"
          language={lang}
          value={lang === 'json' ? JSON.stringify(data, null, 2) : data}
          options={{ wordWrap: 'on' }}
        />
      </div>
    </div>
  );
}


export default App;
