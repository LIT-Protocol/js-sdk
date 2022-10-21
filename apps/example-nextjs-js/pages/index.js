import { useEffect, useState } from 'react';
import indexCss from './index.module.css';
import * as module from '@litprotocol-dev/core-browser';

const testCases = [];

// const { blobToBase64String } = require('@litprotocol-dev/utils');
// console.log('blobToBase64String:', blobToBase64String);

// ========== Test Cases ==========

const Index = () => {

  const [loaded, setLoaded] = useState(false);
  const [tests, setTests] = useState([]);
  const [currentResult, setCurrentResult] = useState([]);

  useEffect(() => {

    setLoaded(true);
    setTests(testCases);

    if ( ! tests ) return;

    // -- make it public
    tests.forEach( test => window[test.id] = test.module );

    // -- highlight button
    [...document.querySelectorAll('button')].forEach(btn => {

        btn.addEventListener('click', () => {
    
            [...document.querySelectorAll('button')].forEach(btn => {
                btn.style.backgroundColor = '#EFEFEF';
            });
                
            btn.style.backgroundColor = 'pink';
        });
    });


  }, [tests])

  const recursiveDir = (dir, isBase = false) => {

    const tree = isBase ? dir : dir?.tests;

    if ( tree ){

      return (

        <ul>
          {
            tree.map((test, i) => {
              return <li key={i}>
                {
                  typeof test.module === 'function' ?
                  <button id={test.id} onClick={async () => {
                    const callResult = await test.module(...test.params);
                    console.log(`[test:function] ${test.id}:`, callResult)
                    setCurrentResult(callResult);
                    
                  }}>run {test.id}()</button> : 
                  <button id={test.id} onClick={() => {
                    console.log(`[test:module] ${test.id}:`, test.module);
                    setCurrentResult(test.module);
                  }}>console.log({test.id})</button>
                }
                
                { recursiveDir(test, false) }
              </li>
            })
          }
        </ul>

      )
    }

  }

  function censor(censor) {
    var i = 0;
    
    return function(key, value) {
      if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
        return '[Circular]'; 
      
      if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
        return '[Unknown]';
      
      ++i; // so we know we aren't using the original object anymore
      
      return value;  
    }
  }


  if ( ! loaded ) return <>Loading...</>
  if ( ! tests ) return <>Loading tests...</>

  return (
    <>
      <h1>Testing Next.js - JS</h1><br/>
      <div className={indexCss.flex}>
        {/* ------ Testing Modules ----- */}
        { recursiveDir(tests, true) }

        {/* ---------- Current Result ---------- */}
        <div>
          <h1>Current Result</h1>
          <textarea id="current-result" className={indexCss.currentResult} value={ JSON.stringify(currentResult, censor(currentResult)) }></textarea>
        </div>
      </div>
    </>
  )
}
export default Index;