import * as constantsModule from '@litprotocol-dev/constants/dist';
import * as constantsModuleVanilla from '@litprotocol-dev/constants/vanilla';

const Index = () => {

  const tests = [
    {
      id: 'constantsModule',
      toPrint: constantsModule
    },
    {
      id: 'constantsModuleVanilla',
      toPrint: constantsModuleVanilla
    },
  ]

  return (
    <>
      <h1>Testing Next.js - JS</h1><br/>
      
      {/* ------ Testing Modules ----- */}
      {
        tests.map((test, i) => {
          return (
            <li key={i}>
              <button id={test.id} onClick={() => console.log(`${test.id}:`, test.toPrint)}>print {test.id}</button>
            </li>
          )
        })
      }
    </>
  )
}
export default Index;