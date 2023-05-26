import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import {Otp} from './Otp';

function App() {

  // ----- autogen:app-name:start  -----
const [appName, setAppName] = useState('SMS / Email Authentication and Registration');
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

  return (
    <div className="App">
      <header className="App-header">
        <LitLogo />
        <h4>
          React Demo for: {appName}<br/>
        </h4>
      </header>
      <div className="Otp">
        <Otp/>
      </div>
    </div>
  );
}


export default App;
