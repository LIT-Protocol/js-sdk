import '../../../../packages/ui/src/lib/style.css';
import BrandLogo from 'packages/ui/src/lib/brand-logo';
import Editor from '@monaco-editor/react';
import { useState } from 'react';

export const App = () => {
  const [msg, setMsg] = useState({
    color: null,
    text: null,
  });

  return (
    <div className="flex-col">
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
          // -------------------------------------
          //          INPUT: Event Type                                    
          // -------------------------------------
          */}

        <div className="h-24"></div>

        {/* 
        // ------------------------------------------
        //          INPUT: Lit Action Code                                    
        // ------------------------------------------
        */}

        <div className="h-24"></div>
        {/* 
        // -------------------------------------------------
        //          INPUT: Lit Action JSON Params                                    
        // -------------------------------------------------
        */}
        <div className="cls-code">
          <div className="MonacoEditor">
            <Editor
              language="json"
              value={''}
              onChange={() => {}}
              theme="vs-dark"
              height="200px"
            />
          </div>
        </div>

        <div className="h-24"></div>
      </div>
    </div>
  );
};
