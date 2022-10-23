import { useEffect, useState } from 'react';
import indexCss from './index.module.css';
import { testCases } from './test-cases';
import { ACTION } from './enum';
import { IGNORED_FUNCTIONS } from './cases/IGNORED_FUNCTIONS';
// const { blobToBase64String } = require('@litprotocol-dev/utils');
// console.log('blobToBase64String:', blobToBase64String);

// ========== Test Cases ==========

const Index = () => {

  const [loaded, setLoaded] = useState(false);
  const [tests, setTests] = useState([]);
  const [currentResult, setCurrentResult] = useState([]);
  const [currentCounters, setCurrentCounters] = useState({});
  const [tested, setTested] = useState({});

  /**
   * ----- React Hook: useEffect -----
   */
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

  const CALL_RENDERER = (test) => {

      // -- handle click
      const handleClick = async () => {

        var start = new Date().getTime();
      
        let callResult;

        try{
          callResult = test.params === undefined 
                      ? await test.module
                      : await test.module(...test.params);
        
          const res = callResult === undefined 
                       ? 'Probably returned a VOID'
                       : callResult;

          let result = typeof res === 'object'
                          ? res  
                          : await res();

          var end = new Date().getTime();

          const benchmark = (end - start) + 'ms';

          console.log(`[TEST:CALL] ${test.id}:`, { benchmark, result })

          setCurrentResult({ benchmark, result });

          const counter = {...currentCounters, ...tested}[test.id];
          counter = counter + 1;
          
          const newList = {...currentCounters, ...tested, [test.id]: counter};

          const _coverage = {};
          const _tested = {};

          Object.entries(newList).forEach((item) => {

            if ( item[1] > 0){
              _tested[item[0]] = item[1];
            }else{
              _coverage[item[0]] = item[1];
            }
          });

          console.log("_coverage", _coverage);

          setCurrentCounters(_coverage);
          setTested(_tested);
          
      }catch(e){
        console.error("Error:", e);
        setCurrentResult(e);
        return;
      }
  
      }

      return <button id={test.id} onClick={handleClick}>
        {test.action}: {test.id}()
      </button>;
  }

  const SET_RENDERER = (test) => {

      // -- handle click
      const handleClick = async () => {

        var start = new Date().getTime();
      
        let callResult;

        try{
          callResult = test.params === undefined 
                      ? await test.module
                      : await test.module(...test.params);
        
          const res = callResult === undefined 
                       ? 'Probably returned a VOID'
                       : callResult;

          let result = typeof res === 'object'
                          ? res  
                          : await res();

          var end = new Date().getTime();

          const benchmark = (end - start) + 'ms';

          console.log(`[TEST:SET] ${test.id}:`, { benchmark, result })

          setCurrentResult({ benchmark, result });
      }catch(e){
        console.error("Error:", e);
        setCurrentResult(e);
        return;
      }
  
      }

      return <button className={indexCss.setter} id={test.id} onClick={handleClick}>
        {test.action}UP: {test.id}
      </button>;
  }

  const PRINT_RENDERER = (test) => {
      // -- handle click
      const handleClick = async () => {

        const obj = Object.keys(test.module).filter(key => !IGNORED_FUNCTIONS.includes(key));

        console.log(`[TEST:PRINT] ${test.id}:`, obj);

        setCurrentResult(obj);

        if( test.setCounters ){

          const counters = {};

          obj.forEach( key => {
            counters[key] = 0;
          });

          console.log("counters:", counters);

          setCurrentCounters({...currentCounters, ...counters});

        }
      }

      return <button id={test.id} onClick={handleClick}>
        {test.action}: {test.id}
      </button>
  }

  const CLASS_RENDERER = (test) => {
      // -- handle click
      const handleClick = async () => {
        // console.log("Testing:", await test.module());
        const callResult = new test.module();
        console.log(`[TEST:CLASS] ${test.id}:`, callResult)

        const obj = Object.keys(callResult).filter(key => !IGNORED_FUNCTIONS.includes(key));
        
        setCurrentResult(obj);

        if( test.setCounters ){

          const counters = {};

          obj.forEach( key => {
            counters[key] = 0;
          });

          console.log("counters:", counters);

          setCurrentCounters({...currentCounters, ...counters});

        }
      }

      return <button id={test.id} onClick={handleClick}>
        {test.action}: {test.id}
      </button>;
  }

  const getTestType = (test) => {
    switch(test.action){
      case ACTION.CLASS:
        return CLASS_RENDERER(test);
      case ACTION.SET:
        return SET_RENDERER(test);
      case ACTION.CALL:
        return CALL_RENDERER(test);
      case ACTION.PRINT:
        return PRINT_RENDERER(test);
      default: 
        return 'Not recognized';
    }
  }

  const recursiveDir = (dir, isBase = false) => {

    const tree = isBase ? dir : dir?.tests;

    if ( tree ){

      return (

        <ul>
          {
            tree.map((test, i) => {
              return <li key={i}>
                { getTestType(test) }
                { recursiveDir(test, false) }
              </li>
            })
          }
        </ul>

      )
    }

  }

  if ( ! loaded ) return <>Loading...</>
  if ( ! tests ) return <>Loading tests...</>

  return (
    <div className={indexCss.main}>
      <h1 className={indexCss.header}>[Lit-JS-SDK] Testing Next.js - JS</h1><br/>
      <div className={indexCss.flex}>
        {/* ------ Testing Modules ----- */}
        { recursiveDir(tests, true) }

        {/* ---------- Current Result ---------- */}
        <div className={indexCss.resultContainer}>
          <div className={indexCss.resultTop}>

            <p>Result</p>
            <textarea id="current-result" className={indexCss.currentResult} value={ JSON.stringify(currentResult, null, 2)} onChange={() => {}}></textarea>
          </div>

          <div className={indexCss.resultBottom}>
            <div className={indexCss.resultBottomLeft}>
              <p>Coverage: {Object.keys(currentCounters).length}</p>
              <textarea id="current-result" className={indexCss.currentResult} value={ JSON.stringify(currentCounters, null, 2)} onChange={() => {}}></textarea>
            </div>
            <div className={indexCss.resultBottomRight}>
              <p>Tested: {Object.keys(tested).length}</p>
              <textarea id="current-result" className={indexCss.currentResult} value={ JSON.stringify(tested, null, 2)} onChange={() => {}}></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Index;