import * as constantsModuleDir from '@litprotocol-dev/constants';
import * as constantsModuleDist from '@litprotocol-dev/constants/dist';
import * as constantsModuleVanilla from '@litprotocol-dev/constants/vanilla';
import * as utilsDir from '@litprotocol-dev/utils';
import * as utilsDist from '@litprotocol-dev/utils/dist';
import * as utilsVanillia from '@litprotocol-dev/utils/vanilla';

import { useEffect, useState } from 'react';

// ========== Test Cases ==========
const tests = [
  {
    id: 'constantsModuleDir',
    module: constantsModuleDir
  },
  {
    id: 'constantsModuleDist',
    module: constantsModuleDist
  },
  {
    id: 'constantsModuleVanilla',
    module: constantsModuleVanilla
  },
  {
    id: 'utilsDir',
    module: utilsDir,
    tests: [
      {
        id: 'utils',
        module: utilsDir['utils'],
      },
      {
        id: 'testImportedConstantModules',
        module: utilsDir['testImportedConstantModules'],
      },
    ],
  },
  {
    id: 'utilsDist',
    module: utilsDist,
    tests: [
      {
        id: 'utils',
        module: utilsDist['utils'],
      },
      {
        id: 'testImportedConstantModules',
        module: utilsDist['testImportedConstantModules'],
      },
    ],
  },
  {
    id: 'utilsVanillia',
    module: utilsVanillia,
    tests: [
      {
        id: 'utils',
        module: utilsVanillia['utils'],
      },
      {
        id: 'testImportedConstantModules',
        module: utilsVanillia['testImportedConstantModules'],
      },
    ],
  },
]

const Index = () => {

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
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
                  <button id={test.id} onClick={() => console.log(`[test:module] ${test.id}:`, test.module)}>print {test.id}</button>
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