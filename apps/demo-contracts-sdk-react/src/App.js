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


  const getMintCost = async () => {
    setLang('javascript');
    let code = `import { LitContracts } from '@lit-protocol/contracts-sdk';

(async() => {
  const litContracts = new LitContracts();
  await litContracts.connect();

  // getting mint cost { ms }
  // { Loading... } 
  const mintCost = await litContracts.pkpNftContract.mintCost();
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
      return await litContracts.pkpNftContract.mintCost();
    }, (ms, mintCost) => {
      code = code.replace('{ Loading... }', mintCost);
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    })
  }

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

  const mintNext = async () => {
    setLang('javascript');
    let code = `import { LitContracts } from '@lit-protocol/contracts-sdk';

(async() => {
  const litContracts = new LitContracts();
  await litContracts.connect();

  // getting mint cost { ms }
  // { Loading... } 
  const mintCost = await litContracts.pkpNftContract.mintCost();

  // minting { ms2 }
  // { Loading2... }
  const tx = await litContracts.pkpNftContract.mintNext(2, { value: mintCost });
})();
`;
    setData(code);

    const litContracts = new LitContracts();

    await litContracts.connect();

    console.log("Loading...");

    let mintCost;

    await benchmark(async () => {
      mintCost = await litContracts.pkpNftContract.mintCost();
      return mintCost;
    }, (ms, mintCost) => {

      code = code.replace('{ Loading... }', mintCost);
      code = code.replaceAll('// ,', '// ')
      code = code.replace('{ ms }', `[${ms}]`);
      setData(code);
    })

    let tx;

    await benchmark(async () => {
      tx = await litContracts.pkpNftContract.mintNext(2, { value: mintCost });
      return tx;
    }, (ms, tx) => {

      console.log(tx);
      console.log(tx.hash);

      code = code.replace('{ Loading2... }', `hash: ${tx.hash}`);
      code = code.replaceAll('// ,', '// ')
      code = code.replace('{ ms2 }', `[${ms}]`);
      setData(code);
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}<br/>
          <span>
            <a target="_blank" href="https://github.com/LIT-Protocol/js-sdk/tree/master/packages/contracts-sdk">npm repo</a>&nbsp;|&nbsp;
            <a target="_blank" href="https://github.com/LIT-Protocol/js-sdk/blob/master/apps/demo-contracts-sdk-react">demo repo</a>
          </span>
          
        </h4>
        <button onClick={createInstance}>Create Instance</button>
        <h6>- Read -</h6>
        <button onClick={getMintCost}>pkpnftcontracts.mintCost()</button>

        <h6>- Addtional Read -</h6>
        <button onClick={getTokensByAddress}>pkpNftContractUtil.getTokensByAddress()</button>

        <h6>- Write -</h6>
        <button onClick={mintNext}>pkpNftContractUtil.mintNext()</button>
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
