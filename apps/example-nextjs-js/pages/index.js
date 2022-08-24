import * as constantsModuleLocal from '@litprotocol-dev/constants';
import * as constantsModuleDist from '@litprotocol-dev/constants/dist';

import * as utilsModuleLocal from '@litprotocol-dev/utils';
import * as utilsModuleDist from '@litprotocol-dev/utils/dist';

import { useEffect, useState } from 'react';

// ========== Test Cases ==========
const tests = [
  { id: 'constantsModuleLocal', module: constantsModuleLocal },
  { id: 'constantsModuleDist', module: constantsModuleDist },
  { id: 'utilsModuleLocal', module: utilsModuleLocal },
  { id: 'utilsModuleDist', module: utilsModuleDist },
  // {
  //   id: 'utilsDist',
  //   module: utilsDist,
  //   tests: [
  //     {
  //       id: 'utils',
  //       module: utilsDist['utils'],
  //     },
  //     {
  //       id: 'testImportedConstantModules',
  //       module: utilsDist['testImportedConstantModules'],
  //     },
  //   ],
  // },
]

const Index = () => {

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    // -- make it public
    tests.forEach( test => window[test.id] = test.module );

  })

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
                  <button id={test.id} onClick={() => console.log(`[test:function] ${test.id}:`, test.module())}>run {test.id}()</button> : 
                  <button id={test.id} onClick={() => console.log(`[test:module] ${test.id}:`, test.module)}>console.log({test.id})</button>
                }
                
                { recursiveDir(test, false) }
              </li>
            })
          }
        </ul>

      )
    }

  }

  if ( ! loaded ) return <>Loading...</>

  return (
    <>
      <h1>Testing Next.js - JS</h1><br/>
      
      {/* ------ Testing Modules ----- */}
      { recursiveDir(tests, true) }
    </>
  )
}
export default Index;