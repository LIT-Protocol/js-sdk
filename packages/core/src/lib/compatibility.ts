import { GetSessionSigsProps, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

type Params = GetSessionSigsProps | { [key: string]: any };

type CompatibilityCheckFunc = (params: Params) => boolean;

// Define a map where each key is a combination of function and network,
// and the value is the checking function
const compatibilityChecks = new Map<string, CompatibilityCheckFunc>();

// Add a check for getSessionSigs function and manzano network
compatibilityChecks.set('getSessionSigs:manzano', (params: Params) => {
  if (params?.capacityDelegationAuthSig === undefined) {
    throw new Error('capacityDelegationAuthSig is required for manzano');
  }
  return true;
});

// Add a check for getSessionSigs function and habanero network
compatibilityChecks.set('getSessionSigs:habanero', (params: Params) => {
  if (params?.capacityDelegationAuthSig === undefined) {
    throw new Error('capacityDelegationAuthSig is required for habanero');
  }
  return true;
});

// ... add more checks for different functions here...
// compatibilityChecks.set('funcName:networkName', (params: Params) => {
//   if (params?.capacityDelegationAuthSig === undefined) {
//     throw new Error('capacityDelegationAuthSig is required for cayenne');
//   }
//   return true;
// });

// The compatibilityCheck function using the map
export const compatibilityCheck = ({
  network,
  func,
  params,
}: {
  network: LIT_NETWORKS_KEYS;
  func: string;
  params: Params;
}): boolean => {
  // Construct the key to look up the specific check function
  const key = `${func}:${network}`;
  const checkFunc = compatibilityChecks.get(key);

  // If a specific check function exists for this function and network, execute it
  if (checkFunc) {
    return checkFunc(params);
  }

  // If no specific check exists and no error thrown, return true
  return true;
};
