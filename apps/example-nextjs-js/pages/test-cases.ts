import * as constantsLocal from '@litprotocol-dev/constants';
import * as constantsDist from '@litprotocol-dev/constants-dist';

import * as utilsLocal from '@litprotocol-dev/utils';
import * as utilsDist from '@litprotocol-dev/utils-dist';


export const testCases = [
    { id: 'constantsLocal', module: constantsLocal },
    { id: 'constantsDist', module: constantsDist },
    { 
      id: 'utilsLocal', 
      module: utilsLocal,
      tests: [
        {
          id: 'blobToBase64String',
          module: utilsLocal['blobToBase64String'],
          // params: [ new Blob([1,2,3,4,5]) ]
        }
      ]
    },
    { id: 'utilsDist', module: utilsDist },
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
    {
      id: 'utilsLocal.eth',
      module: utilsLocal.eth,
      tests: [
        {
          id: 'connectWeb3',
          module: utilsLocal.eth['connectWeb3'],
          params: [42220]
        },
        {
          id: 'disconnectWeb3',
          module: utilsLocal.eth.disconnectWeb3,
          params: []
        },
        {
          id: 'checkAndSignEVMAuthMessage',
          module: utilsLocal.eth.checkAndSignEVMAuthMessage,
          params: [{chain: 'ethereum', resources: [], switchChain: false}]
        },
        {
          id: 'checkAndSignEVMAuthMessage-switchChain',
          module: utilsLocal.eth.checkAndSignEVMAuthMessage,
          params: [{chain: 'ethereum', resources: [], switchChain: true}]
        },
      ]
    },
    {
      id: 'utilsLocal.lit',
      module: utilsLocal.lit,
      tests:[
        {
          id: 'checkAndSignAuthMessage',
          module: utilsLocal.lit.checkAndSignAuthMessage,
          params: [{chain: 'ethereum', resources: [], switchChain: true}]
        }
      ]
    }
  ]
  