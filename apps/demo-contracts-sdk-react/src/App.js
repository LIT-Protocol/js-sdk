import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { LitContracts } from '@lit-protocol/contracts-sdk';

function App() {

  // ----- autogen:app-name:start  -----
const [appName, setAppName] = useState('demo-contracts-sdk-react');
// ----- autogen:app-name:end  -----

  const [lang, setLang] = useState('json');
  const [data, setData] = useState({
    data: {
      name: 'Lit Protocol',
      description: 'Threadshold cryptography for the win!',
    }
  });

  const go = async () => {

  }

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}
        </h4>
        <button onClick={go}>Mint</button>
        <button onClick={go}>Mint</button>
      </header>

      <div className='editor'>
        <Editor
          theme="vs-dark"
          height="100vh"
          language={lang}
          value={JSON.stringify(data, null, 2)}
        />
      </div>
    </div>
  );
}


export default App;
