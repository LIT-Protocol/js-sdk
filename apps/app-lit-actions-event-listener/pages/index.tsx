import MonacoEditor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import beautify from 'json-beautify';

import { SelectMenu, AlertDialog } from '@lit-protocol/ui';
import { validateParams } from './util-param-validator';

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
      name: 'block event',
      enabled: true,
    },
    {
      name: 'periodic event',
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

  const resetMessage = () => {
    setMsg({
      color: null,
      text: null,
    });
  };

  const [name, setName] = React.useState('');

  const [formReady, setFormReady] = React.useState(false);

  useEffect(() => {
    // -- check if the form is ready
    if (selectedEvent && jsCode && jsonCode) {
      setFormReady(true);
    } else {
      setFormReady(false);
    }
  }, [jsonCode, jsCode, selectedEvent, events]);

  // ------------------------------------------------
  //          Event: Click Register Button
  // ------------------------------------------------
  const onRegister = async () => {
    console.log('onRegister');

    let check_1 = validateParams('must_have', [
      { selectedEvent },
      { jsCode },
      { jsonCode },
      { name },
    ]);
    let check_2 = validateParams('is_json', [{ jsonCode }]);

    if (!check_1.validated || !check_2.validated) {
      setMsg({
        color: 'red',
        text: check_1.message ? check_1.message : check_2.message,
      });

      return;
    }
    resetMessage();


    
    // if (!jsonCode) {

    //   alert('Please enter lit action JSON params');
    //   return;
    // }

    // -- parse the JSON params

    // -- register the lit action

    // -- redirect to the lit actions page

    // -- show a success message

    // -- show a failure message

    // -- show a loading message
  };

  return (
    <div className="flex-col">
      {/* <div className="DEBUG">
        formReady: {formReady ? 'true' : 'false'}
        <br />
        name: {name}
        <br />
        selectedEvent: {selectedEvent}
        <br />
        jsCode: {jsCode}
        <br />
        jsonCode: {jsonCode}
        <br />
      </div> */}

      <div className="cls-app">
        <div className="h-24"></div>
        <h1>Lit Actions Event Listener</h1>
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
