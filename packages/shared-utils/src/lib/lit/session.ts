import {
  EITHER_TYPE,
  IEither,
  JsonAuthSig,
  LIT_SESSION_KEY_URI,
  LOCAL_STORAGE_KEYS,
  SessionKeyPair,
  SessionSigsProp,
} from '@litprotocol-dev/constants';
import {
  checkAndSignAuthMessage,
  generateSessionKeyPair,
  getStorageItem,
  uint8arrayFromString,
  uint8arrayToString,
} from '@litprotocol-dev/shared-utils';
import { SiweMessage } from 'lit-siwe';
import nacl from 'tweetnacl';
/** ========== Local Helpers ========== */

/**
 * Get the session key pair from local storage if it exists,
 * otherwise generate a new one
 *
 * @returns { SessionKeyPair } sessionKey
 */
const getSessionKey = (): SessionKeyPair => {
  const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY;

  // check if we already have a session key + signature for this chain
  let sessionKeyOrError: IEither = getStorageItem(storageKey);
  let sessionKey: SessionKeyPair;

  // if we don't have a session key, generate one
  if (sessionKeyOrError.type === EITHER_TYPE.ERROR) {
    sessionKey = generateSessionKeyPair();
    localStorage.setItem(storageKey, JSON.stringify(sessionKey));
  } else {
    sessionKey = JSON.parse(sessionKeyOrError.result);
  }

  return sessionKey;
};

/**
 * Get the wallet signature from local storage if it exists,
 * otherwise check and sign auth message
 *
 * @returns { JsonAuthSig } walletSignature
 */
const getWalletSignature = async (
  params: SessionSigsProp,
  sessionKeyUri: string
): Promise<JsonAuthSig> => {
  const storageKey = LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;

  // check if we already have a wallet signature
  let walletSignatureOrError: IEither = getStorageItem(storageKey);
  let walletSignature: JsonAuthSig;

  // if we don't have a wallet signature
  if (walletSignatureOrError.type === EITHER_TYPE.ERROR) {
    walletSignature = await checkAndSignAuthMessage({
      chain: params.chain,
      resources: params.sessionCapabilities,
      switchChain: params.switchChain,
      expiration: params.expiration,
      uri: sessionKeyUri,
    });
    localStorage.setItem(storageKey, JSON.stringify(walletSignature));
  } else {
    walletSignature = JSON.parse(walletSignatureOrError.result);
  }

  return walletSignature;
};

/** ========== Exports ========== */

/**
 *
 * High level, how this works:
 * 1. Generate or retrieve session key
 * 2. Generate or retrieve the wallet signature of the session key
 * 3. Sign the specific resources with the session key
 *
 * @param { SessionSigsProp } params
 *
 * @returns
 */
export async function getSessionSigs(params: SessionSigsProp) {
  // ========== Prepare Params ==========

  let {
    expiration,
    chain,
    resources = [],
    sessionCapabilities,
    switchChain,
    litNodeClient,
  } = params;

  // -- get session key
  const sessionKey: SessionKeyPair = getSessionKey();

  // -- get session key URI
  let sessionKeyUri = getSessionKeyUri({ publicKey: sessionKey.publicKey });

  // -- get sessionCapabilities
  // if the user passed no sessionCapabilities, let's create them for them
  // with wildcards so the user doesn't have to sign every time
  if (!sessionCapabilities || sessionCapabilities.length === 0) {
    sessionCapabilities = resources.map((resource) => {
      const { protocol, resourceId } = parseResource({ resource });
      return `${protocol}Capability://*`;
    });
  }

  // -- get wallet signature
  let walletSig: JsonAuthSig = await getWalletSignature(params, sessionKeyUri);
  
  //   ========== Validate Signature ==========
  // Check a few things, including that:
  // 1. the sig isn't expired
  // 2. the sig is for the correct session key
  // 3. the sig has the sessionCapabilities requires to fulfill the resources requested
  
  // NOTE: "verify" doesn't exist on SwieMessage
  const siweMessage: any = new SiweMessage(walletSig.signedMessage);
  let needToReSignSessionKey = false;

  try {
    // make sure it's legit
    await siweMessage.verify({ signature: walletSig.sig });
  } catch (e) {
    needToReSignSessionKey = true;
  }

  // make sure the sig is for the correct session key
  if (siweMessage.uri !== sessionKeyUri) {
    needToReSignSessionKey = true;
  }

  // make sure the sig has the session capabilities required to fulfill the resources requested
  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    const { protocol, resourceId } = parseResource({ resource });

    // check if we have blanket permissions or if we authed the specific resource for the protocol
    const permissionsFound = sessionCapabilities.some((capability: any) => {
      const capabilityParts = parseResource({ resource: capability });
      return (
        capabilityParts.protocol === protocol &&
        (capabilityParts.resourceId === '*' ||
          capabilityParts.resourceId === resourceId)
      );
    });
    if (!permissionsFound) {
      needToReSignSessionKey = true;
    }
  }

  if (needToReSignSessionKey) {
    walletSig = await checkAndSignAuthMessage({
      chain,
      resources: sessionCapabilities,
      switchChain,
      expiration,
      uri: sessionKeyUri,
    });
  }

  //   ========== Sign Resources with Session Key ==========
  // okay great, now we have a valid signed session key
  // let's sign the resources with the session key
  // 5 minutes is the default expiration for a session signature
  // because we can generate a new session sig every time the user wants to access a resource
  // without prompting them to sign with their wallet
  let sessionExpiration = new Date(Date.now() + 1000 * 60 * 5);

  const signingTemplate = {
    sessionKey: sessionKey.publicKey,
    resources,
    capabilities: [walletSig],
    issuedAt: new Date().toISOString(),
    expiration: sessionExpiration.toISOString(),
  };
  const signatures : any = {};

  litNodeClient.connectedNodes.forEach((nodeAddress: any) => {
    const toSign = {
      ...signingTemplate,
      nodeAddress,
    };
    let signedMessage = JSON.stringify(toSign);
    const uint8arrayKey = uint8arrayFromString(sessionKey.secretKey, 'base16');
    const uint8arrayMessage = uint8arrayFromString(signedMessage, 'utf8');
    let signature = nacl.sign.detached(uint8arrayMessage, uint8arrayKey);
    // console.log("signature", signature);
    signatures[nodeAddress] = {
      sig: uint8arrayToString(signature, 'base16'),
      derivedVia: 'litSessionSignViaNacl',
      signedMessage,
      address: sessionKey.publicKey,
      algo: 'ed25519',
    };
  });

  return signatures;
}

/**
 *
 * Get Session Key URI eg. lit:session:
 *
 * @returns { string }
 *
 */
export const getSessionKeyUri = ({
  publicKey,
}: {
  publicKey: string;
}): string => {
  return LIT_SESSION_KEY_URI + publicKey;
};

/**
 *
 * Parse resource
 *
 * @property { any } resource
 *
 * @returns { { protocol: string, resourceId: string } }
 *
 */
export const parseResource = ({
  resource,
}: {
  resource: any;
}): {
  protocol: any;
  resourceId: any;
} => {
  const [protocol, resourceId] = resource.split('://');
  return { protocol, resourceId };
};
