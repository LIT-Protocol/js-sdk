import { AccessControlConditions } from '@litprotocol-dev/constants';
import * as LitJsSdk from '@litprotocol-dev/core-browser';
import { ACTION } from '../enum';

export const CASE_000_EXPORTS = [
    {
      id: 'CASE 000 - Check exports',
      action: ACTION.SET,
      module: (async () => {}),
    },
    {
      id: 'LitJsSdk', 
      action: ACTION.PRINT,
      module: LitJsSdk,
      setCounters: true,
      tests: [
        {
          id: 'LitNodeClient',
          action: ACTION.CLASS,
          module: LitJsSdk.LitNodeClient,
          setCounters: true,
        },
      ]
     }
  ]
