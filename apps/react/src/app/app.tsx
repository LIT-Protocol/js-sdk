// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import NxWelcome from './nx-welcome';

// import { uint8arrayToString } from '@litprotocol-dev/uint8arrays';
import * as accs from '@litprotocol-dev/access-control-conditions';

export function App() {
  return (
    <>
      {/* <NxWelcome title="react" /> */}
      {/* create a button */}
      <button
        onClick={() => {
          // create a new access condition
          console.log(accs);
        }}
      >
        Create Access Condition
      </button>
      <div />
    </>
  );
}

export default App;
