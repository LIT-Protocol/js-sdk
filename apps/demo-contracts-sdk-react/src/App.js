import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { benchmark } from './utiils';

function App() {

  // ----- autogen:app-name:start  -----
  const [appName, setAppName] = useState('@lit-protocol/contracts-sdk');
  // ----- autogen:app-name:end  -----

  const [lang, setLang] = useState('json');
  const [data, setData] = useState({
    data: {
      name: '@lit-protocol/contracts-sdk',
      description: 'ContractsSDK is a bundled package that allows you to make calls to Lit Protocol smart contracts. Some contracts come with additional abstracted functions that can be accessed by appending Util to the contract variable name, for example, pkpNftContract becomes pkpNftContractUtil.',
      installation: 'yarn add @lit-protocol/contracts-sdk',
    }
  });
  // ===================================
  //          create instance                                    
  // ===================================
  const createInstance = async () => {
    setLang('javascript');
    let code = `import { LitContracts } from '@lit-protocol/contracts-sdk';

(async() => {
  const litContracts = new LitContracts();
  await litContracts.connect();
})();
`;
    setData(code);

    const litContracts = new LitContracts();

    await litContracts.connect();

    window.litContracts = litContracts;
  }

  // =======================================================
  //          get mint cost from pkp nft contract                                    
  // =======================================================
  const getMintCost = async () => {
    setLang('javascript');
    let code = `import { LitContracts } from '@lit-protocol/contracts-sdk';

(async() => {
  const litContracts = new LitContracts();
  await litContracts.connect();

  // getting mint cost { ms }
  // { Loading... } 
  const mintCost = await litContracts.pkpNftContract.read.mintCost();
})();
`;
    setData(code);

    const litContracts = new LitContracts();

    await litContracts.connect();

    console.log("Loading...");
    // const tokens = await litContracts.pkpNftContractUtil.read.getTokensByAddress("0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1");

    // console.log(tokens);

    // wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 500));

    benchmark(async () => {
      const mintCost = await litContracts.pkpNftContract.read.mintCost();
      console.log("mintCost: ", mintCost);
      return mintCost;
    }, (ms, mintCost) => {
      code = code.replace('{ Loading... }', mintCost);
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    })
  }

  // ===============================================
  //          get tokens by owner address                                    
  // ===============================================
  const getTokensByAddress = async () => {
    setLang('javascript');
    let code = `import { LitContracts } from '@lit-protocol/contracts-sdk';

(async() => {
  const litContracts = new LitContracts();
  await litContracts.connect();

  // getting tokens { ms }
  // { Loading... } 
  const tokens = await litContracts
                       .pkpNftContractUtil
                       .read
                       .getTokensByAddress("0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1");
})();
`;
    setData(code);

    const litContracts = new LitContracts();

    await litContracts.connect();

    console.log("Loading...");

    // wait for 1 second
    // await new Promise(resolve => setTimeout(resolve, 500));

    benchmark(async () => {
      return await litContracts.pkpNftContractUtil.read.getTokensByAddress("0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1");
    }, (ms, tokens) => {

      tokens = tokens.map(token => {
        return token + '\n  // ';
      })

      console.log(tokens);


      code = code.replace('{ Loading... }', tokens);
      code = code.replaceAll('// ,', '// ')
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    })
  }

  // ============================================================
  //          use pkp nft contract to mint a new token                                    
  // ============================================================
  const mintNext = async () => {
    setLang('javascript');
    let code = `import { LitContracts } from '@lit-protocol/contracts-sdk';

(async() => {
  const litContracts = new LitContracts();
  await litContracts.connect();

  // getting mint cost { ms }
  // { Loading... } 
  const mintCost = await litContracts.pkpNftContract.read.mintCost();

  // minting { ms }
  // { Loading... }
  const tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost });

  // { ms }
  // { Loading... }
  const tokenId = (await tx.wait()).events[1].topics[3];
})();
`;
    setData(code);

    const litContracts = new LitContracts();

    await litContracts.connect();

    console.log("Loading...");

    let mintCost;

    await benchmark(async () => {
      mintCost = await litContracts.pkpNftContract.read.mintCost();
      return mintCost;
    }, (ms, mintCost) => {

      code = code.replace('{ Loading... }', mintCost);
      code = code.replaceAll('// ,', '// ')
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    })

    let tx;

    await benchmark(async () => {
      tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost });
      return tx;
    }, (ms, tx) => {

      console.log(tx);
      console.log(tx.hash);

      code = code.replace('{ Loading... }', `hash: ${tx.hash}`);
      code = code.replaceAll('// ,', '// ')
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    })

    await benchmark(async () => {
      const tokenId = (await tx.wait()).events[1].topics[3]
      return tokenId;
    }, (ms, tokenId) => {

      console.log("tokenId:", tokenId);

      // convert to decimal, then to string from hex

      code = code.replace('{ Loading... }', `tokenId: ${tokenId}`);
      code = code.replaceAll('// ,', '// ')
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}: "2.1.118"<br />
          <span>
            <a target="_blank" href="https://github.com/LIT-Protocol/js-sdk/tree/master/packages/contracts-sdk">npm repo</a>&nbsp;|&nbsp;
            <a target="_blank" href="https://github.com/LIT-Protocol/js-sdk/blob/master/apps/demo-contracts-sdk-react">demo repo</a>
          </span>

        </h4>
        <button onClick={createInstance}>Create Instance</button>
        <button onClick={getMintCost}>Get mint cost from pkp nft contract</button>
        <button onClick={getTokensByAddress}>Get tokens by owner address</button>
        <button onClick={mintNext}>Use pkp nft contract to mint a new token</button>
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
