import './App.css';
import { useState } from 'react';
import LitLogo from './LitLogo';
import Button from 'tiny-ui/lib/button';
import {Otp} from './Otp';

function App() {

  // ----- autogen:app-name:start  -----
const [appName, setAppName] = useState('SMS / Email authentication and Signup');
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
      </header>
      <div className="Otp">
        <Otp/>
      </div>
    </div>
  );
}


export default App;
