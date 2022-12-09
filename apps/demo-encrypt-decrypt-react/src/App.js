import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Editor from '@monaco-editor/react';
import { benchmark } from './utils';

function App() {

  // ----- autogen:app-name:start  -----
const [appName, setAppName] = useState('demo-encrypt-decrypt-react');
// ----- autogen:app-name:end  -----

  const [npmRepo, setNpmRepo] = useState('');
  const [demoRepo, setDemoRepo] = useState('');
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
          React Demo for: {appName}<br/>
          <span>
            <a target="_blank" href={npmRepo}>npm repo</a>&nbsp;|&nbsp;
            <a target="_blank" href={demoRepo}>demo repo</a>
          </span>
        </h4>
        <button onClick={go}>Go!</button>
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
