import './App.css';
import { useEffect, useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { benchmark } from './utils';
import { PKPWallet } from '@lit-protocol/pkp-ethers.js';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import { pkpNft } from './pkp-nft';

function App() {
  // ----- autogen:app-name:start  -----
  const [appName, setAppName] = useState('@lit-protocol/pkp-ethers.js');
  // ----- autogen:app-name:end  -----

  const [npmRepo, setNpmRepo] = useState(
    'https://www.npmjs.com/package/@lit-protocol/pkp-ethers.js'
  );
  const [demoRepo, setDemoRepo] = useState(
    'https://github.com/LIT-Protocol/js-sdk/tree/master/apps/demo-pkp-ethers-react'
  );
  const [lang, setLang] = useState('json');
  const [data, setData] = useState({
    data: {
      name: 'Lit Protocol',
      description: 'Threadshold cryptography for the win!',
    },
  });

  const [pkpPubKey, setPkpPubKey] = useState(
    '0x04c9b9cba2d50581c92c3aaf6328c19aa7419187d8ad0d1efa50d62c916c8db7649b716afb444e3c0de5036826565214b6a15f70e6afb4902910c5d0a820605165'
  );

  const [controllerSessionSigs, setControllerSessionSigs] = useState();

  const [pkpWallet, setPkpWallet] = useState();

  const contractCall = async () => {
    if (!pkpWallet) {
      setLang('javascript');
      setData('// PKP Wallet not initialized. ');
      return;
    }

    let code = `import { pkpNft } from './pkp-nft';

      const provider = pkpWallet.rpcProvider; // for read
      const signer = pkpWallet; // for write

      const contractRead = new ethers.Contract(pkpNft.address, pkpNft.abi, provider);
      const contractWrite = new ethers.Contract(pkpNft.address, pkpNft.abi, signer);

      // { ms }
      // { Loading... }
      const mintCost = await contractRead.mintCost();

      // { ms }
      // { Loading... }
      const tx = await contractWrite.populateTransaction.mintNext(2, { 
        value: mintCost 
      } );

      // { ms }
      // { Loading... }
      const signedTx = await signer.signTransaction(tx);

      // { ms }
      // { Loading... }
      const sentTx = await signer.sendTransaction(signedTx);

      // { txLink }
    `;

    setData(code);

    console.log(pkpNft);

    const provider = pkpWallet.rpcProvider; // for read
    const signer = pkpWallet; // for write

    const contractRead = new ethers.Contract(
      pkpNft.address,
      pkpNft.abi,
      provider
    );
    const contractWrite = new ethers.Contract(
      pkpNft.address,
      pkpNft.abi,
      signer
    );

    benchmark(
      async () => {
        const mintCost = await contractRead.mintCost();
        return mintCost;
      },
      (ms, mintCost) => {
        code = code.replace('{ ms }', `[${ms}]`);
        code = code.replace('{ Loading... }', `mintCost: ${mintCost}`);
        setData(code);

        benchmark(
          async () => {
            const tx = await contractWrite.populateTransaction.mintNext(2, {
              value: mintCost,
            });
            return tx;
          },
          (ms, tx) => {
            code = code.replace('{ ms }', `[${ms}]`);
            code = code.replace('{ Loading... }', `tx: ${JSON.stringify(tx)}`);
            setData(code);

            benchmark(
              async () => {
                const signedTx = await signer.signTransaction(tx);
                return signedTx;
              },
              (ms, signedTx) => {
                code = code.replace('{ ms }', `[${ms}]`);
                code = code.replace(
                  '{ Loading... }',
                  `signedTx: ${JSON.stringify(signedTx)}`
                );
                setData(code);

                benchmark(
                  async () => {
                    const sentTx = await signer.sendTransaction(signedTx);
                    return sentTx;
                  },
                  (ms, sentTx) => {
                    code = code.replace('{ ms }', `[${ms}]`);
                    code = code.replace(
                      '{ Loading... }',
                      `sentTx: ${JSON.stringify(sentTx)}`
                    );
                    code = code.replace(
                      '{ txLink }',
                      `https://mumbai.polygonscan.com/tx/${sentTx.hash}`
                    );
                    setData(code);
                  }
                );
              }
            );
          }
        );
      }
    );

    // const tx = await contract.populateTransaction.mintNext(2, { value: 100000000000000 } );
    // console.log("tx:", tx);

    // const signedTx = await pkpSigner.signTransaction(tx2);
    // console.log("signedTx:", signedTx);

    // const sentTx = await pkpWallet.sendTransaction(signedTx);
    // console.log("sentTx:", sentTx);
  };

  const signMessage = async () => {
    if (!pkpWallet) {
      setLang('javascript');
      setData('// PKP Wallet not initialized. ');
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
    const msg = 'Secret Message.. shh!';

    await benchmark(
      async () => {
        const signedMsg = await pkpWallet.signMessage(msg);

        return signedMsg;
      },
      async (ms, signedMsg) => {
        code = code.replace('{ ms }', `[${ms}]`);
        code = code.replace('{ Loading... }', `signedMsg: ${signedMsg}`);
        setData(code);

        await benchmark(
          async () => {
            const signMsgAddr = ethers.utils.verifyMessage(msg, signedMsg);

            return signMsgAddr;
          },
          async (ms, signMsgAddr) => {
            code = code.replace('{ ms }', `[${ms}]`);
            code = code.replace('{ Loading... }', `signedMsg: ${signMsgAddr}`);
            setData(code);

            await benchmark(
              async () => {
                const signerAddress = signMsgAddr.toLowerCase();
                const pkpWalletAddress = (
                  await pkpWallet.getAddress()
                ).toLowerCase();
                const verified = signerAddress === pkpWalletAddress;
                return { verified, signerAddress, pkpWalletAddress };
              },
              async (ms, data) => {
                code = code.replace('{ ms }', `[${ms}]`);
                code = code.replace(
                  '{ Loading... }',
                  `
                  // signerAddress: ${data.signerAddress}
                  // pkpWalletAddress: ${data.pkpWalletAddress}
                  // verified: ${data.verified}`
                );
                setData(code);
              }
            );
          }
        );
      }
    );
  };

  const genSessionSigs = async () => {
    let code = `
      const litNodeClient = new LitNodeClient({
        litNetwork: 'serrano',
        debug: false,
      });
      await litNodeClient.connect();

      const sessionSigs = await litNodeClient.getSessionSigs({
        resources: ['litAction://*'],
        chain: 'ethereum',
        authNeededCallback,
      });

      { Generating session sigs... }`;

    setLang('javascript');

    await benchmark(
      async () => {
        const litNodeClient = new LitNodeClient({
          litNetwork: 'serrano',
          debug: false,
        });
        await litNodeClient.connect();

        const sessionSigs = await litNodeClient.getSessionSigs({
          resources: ['litAction://*'],
          chain: 'ethereum',
        });
        return sessionSigs;
      },
      (ms, sessionSigs) => {
        code = code.replace(
          '{ Loading... }',
          '// OUTPUT:\nconst output = ' + JSON.stringify(sessionSigs, null, 2)
        );
        code = code.replace('{ ms }', `[${ms}]`);
        setData(code);
        setControllerSessionSigs(sessionSigs);
      }
    );
  };

  const go = async () => {
    if (!controllerSessionSigs) {
      setLang('javascript');
      setData('// Need to generate session sigs first!');
      return;
    }

    let code = `
      const _pkpWallet = new PKPWallet({
        pkpPubKey: pkpPubKey,
        controllerSessionSigs: controllerSessionSigs,
        provider: "https://rpc-mumbai.maticvigil.com",
      });

      // { ms }
      await _pkpWallet.init();

      { Loading... }`;

    const _pkpWallet = new PKPWallet({
      pkpPubKey: pkpPubKey,
      controllerSessionSigs: controllerSessionSigs,
      provider: 'https://rpc-mumbai.maticvigil.com',
    });

    await _pkpWallet.init();

    setLang('javascript');

    await benchmark(
      async () => {
        await _pkpWallet.init();
        return _pkpWallet;
      },
      (ms, _pkpWallet) => {
        code = code.replace(
          '{ Loading... }',
          '// OUTPUT:\nconst output = ' + JSON.stringify(_pkpWallet, null, 2)
        );
        code = code.replace('{ ms }', `[${ms}]`);
        setData(code);
        setPkpWallet(_pkpWallet);
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}
          <br />
          <span>
            <a target="_blank" href={npmRepo}>
              npm repo
            </a>
            &nbsp;|&nbsp;
            <a target="_blank" href={demoRepo}>
              demo repo
            </a>
          </span>
        </h4>
        <table>
          <tr>
            <td>
              <label>PKP Public Key</label>
            </td>
            <td>
              <label>Controller Session Sigs</label>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type="text"
                value={pkpPubKey}
                onChange={(e) => setPkpPubKey(e.target.value)}
              />
            </td>
            <td>
              <input
                type="text"
                value={JSON.stringify(controllerSessionSigs)}
                onChange={(e) =>
                  setControllerSessionSigs(JSON.parse(e.target.value))
                }
              />
            </td>
          </tr>
        </table>

        <p>Setup:</p>
        <p>1. Paste in your PKP public key</p>
        <button onClick={genSessionSigs}>2. Create session sigs</button>
        <button onClick={go}>3. Initialize PKP Wallet</button>

        <p>Test:</p>
        <div className="row">
          <button onClick={signMessage}>Sign Message</button>
          <button onClick={contractCall}>Contract Call</button>
        </div>
      </header>

      <div className="editor">
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
