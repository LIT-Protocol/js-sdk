import MonacoEditor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import beautify from 'json-beautify';

import { SelectMenu, AlertDialog } from '@lit-protocol/ui';
import { validateParams } from './util-param-validator';
import BrandLogo from 'packages/ui/src/lib/brand-logo';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import DebugViewer from 'packages/ui/src/lib/ui-debug';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { JsonAuthSig } from '@lit-protocol/constants';

export function Index() {
  // ---------------------------------------
  //          Default form values
  // ---------------------------------------
  const [jsCode, setJsCode] = React.useState(`(async () => {
// lit action code goes here
})();`);

  const [jsonCode, setJsonCode] = React.useState(
    beautify(
      {
        sig: 'exmaple-lit-action-sig',
        pubKey: '123',
      },
      null,
      2
    )
  );

  const [events, setEvents] = React.useState([
    {
      name: 'events',
      type: 'label',
    },
    {
      name: 'periodic event',
      enabled: true,
    },
    {
      name: 'block event',
      enabled: true,
    },
    {
      name: 'webhook event',
      enabled: true,
    },
    {
      name: 'contract event',
      enabled: true,
    },
    {
      name: 'transaction event',
      enabled: true,
    },
  ]);

  const [selectedEvent, setSelectedEvent] = React.useState('');
  const [msg, setMsg] = React.useState({
    color: null,
    text: null,
  });

  const [name, setName] = React.useState('');

  const [formReady, setFormReady] = React.useState(false);

  const [litNodeClient, setLitNodeClient] = React.useState<LitNodeClient>(null);

  const resetMessage = () => {
    setMsg({
      color: null,
      text: null,
    });
  };

  // ------------------------------
  //          Use Effect
  // ------------------------------
  useEffect(() => {
    // -- check if the form is ready
    if (selectedEvent && jsCode && jsonCode) {
      setFormReady(true);
    } else {
      setFormReady(false);
    }

    // -- init LitJsSdk
    if (!litNodeClient) {
      (async () => {
        const client = new LitNodeClient({
          litNetwork: 'serrano',
          debug: false,
        });

        await client.connect();

        setLitNodeClient(client);
      })();
    }
  }, [jsonCode, jsCode, selectedEvent, events, litNodeClient]);

  // ------------------------------------------------
  //          Event: Click Register Button
  // ------------------------------------------------
  const onRegister = async () => {
    // -- validata params
    const check_1 = validateParams('must_have', [
      { selectedEvent },
      { jsCode },
      { jsonCode },
      { name },
    ]);

    const check_2 = validateParams('is_json', [{ jsonCode }]);

    if (!check_1.validated || !check_2.validated) {
      setMsg({
        color: 'red',
        text: check_1.message ? check_1.message : check_2.message,
      });

      return;
    }
    resetMessage();

    // -- check auth message
    let authSig: JsonAuthSig;
    authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'mumbai',
    });

    // -- ok, let's test run the lit action code without params
    // try {
    //   const res = await litNodeClient.executeJs({
    //     authSig,
    //     code: jsCode,
    //     jsParams: {},
    //   });
    //   console.log(res);
    // } catch (e) {
    //   setMsg({
    //     color: 'red',
    //     text: `[${e.name} (${e.errorCode})]: ${e.message}}`,
    //   });
    //   return;
    // }

    const randomString = (length: number) => {
      let result = '';
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    };

    const sizeTest = randomString(250000);

    // -- ok, let's register the lit action
    const res = await fetch('/api/register', {
      method: 'post',
      body: JSON.stringify({
        code: `
        (async () => {
          var sizeTest = '${sizeTest}';
          if ( sizeTest.length !== 250000 ) {

            throw new Error('sizeTest.length !== 250000');
          }
        })();
        `,
        jsParams: jsonCode,
        authSig,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();

    console.log('data:', data);
  };

  return (
    <div className="flex-col">
      <DebugViewer
        states={[
          { formReady },
          { selectedEvent },
          { jsCode },
          { jsonCode },
          { msg },
          { name },
          { litNodeClient: litNodeClient ? 'true' : 'false' },
        ]}
      />

      <div className="cls-app">
        <div className="h-24"></div>
        <div className="flex">
          {/* <div className="logo">
          <BrandLogo />
        </div> */}
          <h1>Lit Actions Event Listener</h1>
        </div>
        <div className="h-24"></div>
        {/* 
        // --------------------------------
        //          Message area                                    
        // --------------------------------
        */}
        <div className={`${msg.text !== null ? 'active' : ''} wrapper-message`}>
          <div className={`cls-message ${msg?.color}`}>{msg?.text}</div>
          <div className="h-24"></div>
        </div>

        <div className="flex space-between gap-12">
          {/* 
          // ------------------------------------------
          //          INPUT: Lit Action Name                                    
          // ------------------------------------------
          */}
          <div className="cls-input w-full">
            <input
              className="Input"
              type="text"
              id="firstName"
              placeholder="name your lit action"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 
          // -------------------------------------
          //          INPUT: Event Type                                    
          // -------------------------------------
          */}
          <div className="">
            <SelectMenu
              label="Select an event"
              onChange={setSelectedEvent}
              items={events}
            />
          </div>
        </div>

        <div className="h-24"></div>

        {/* 
        // ------------------------------------------
        //          INPUT: Lit Action Code                                    
        // ------------------------------------------
        */}
        <div className="cls-code">
          <div className="MonacoEditor">
            <MonacoEditor
              language="javascript"
              value={jsCode}
              onChange={setJsCode}
              theme="vs-dark"
              height="200px"
            />
          </div>
        </div>

        <div className="h-24"></div>
        {/* 
        // -------------------------------------------------
        //          INPUT: Lit Action JSON Params                                    
        // -------------------------------------------------
        */}
        <div className="cls-code">
          <div className="MonacoEditor">
            <MonacoEditor
              language="json"
              value={jsonCode}
              onChange={setJsonCode}
              theme="vs-dark"
              height="200px"
            />
          </div>
        </div>

        <div className="h-24"></div>
        {/* 
        // ----------------------------------------
        //          INPUT: Submit Button                                    
        // ----------------------------------------
        */}
        <button className="button" onClick={onRegister}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Index;
