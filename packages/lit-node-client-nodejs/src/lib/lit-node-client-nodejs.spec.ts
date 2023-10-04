// @ts-nocheck

// This will prevent it logging the following
// [Lit-JS-SDK v2.2.39] ✅ [BLS SDK] wasmExports loaded
// [Lit-JS-SDK v2.2.39] ✅ [ECDSA SDK NodeJS] wasmECDSA loaded.
global.jestTesting = true;

import { LitNodeClientNodeJs } from './lit-node-client-nodejs';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';

import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import * as LITCONFIG from 'lit.config.json';
<<<<<<< HEAD

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
    subtle: {
      digest: (algorithm: string, data: Uint8Array) => {
        return new Promise((resolve, reject) =>
          resolve(
            createHash(algorithm.toLowerCase().replace('-', ''))
              .update(data)
              .digest()
          )
        );
      },
    },
  },
});

const getWalletAuthSig = async (prop) => {
  const { privateKey, chainId } = prop;

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // const buffer = Buffer.from(privateKey, 'hex');

  const wallet = new ethers.Wallet(privateKey);

  const origin = 'https://localhost/login';

  const message = `Generate a server auth signature for ${wallet.address} at ${now}`;

  const statement = message;

  const siweMessage = new SiweMessage({
    domain: 'node',
    address: wallet.address,
    uri: origin,
    statement,
    version: '1',
    chainId,
  });

  const messageToSign = siweMessage.prepareMessage();

  const signature = await wallet.signMessage(messageToSign);

  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: recoveredAddress,
  };

  return authSig;
};
=======
>>>>>>> feature/lit-1447-js-sdk-merge-sdk-v3-into-revamp-feature-branch-2

const isClass = (v) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitNodeClientNodeJs', () => {

  // --start;
  it('imported { LitNodeClientNodeJs } is a class', async () => {
    expect(isClass(LitNodeClientNodeJs)).toBe(true);
  });

  it('should be able to instantiate a new LitNodeClientNodeJs', async () => {
    const litNodeClient = new LitNodeClientNodeJs();
    expect(litNodeClient).toBeDefined();
  });


  it('should be able to instantiate a new LitNodeClientNodeJs to localhost', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'localhost',
    });
    expect(litNodeClient).toBeDefined();
  });

  it('gets capabilities', async () => {
    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    let hashedResourceId = await hashResourceIdForSigning(resourceId);

    const litResource = new LitAccessControlConditionResource(hashedResourceId);

    let sessionCapabilityObject =
      LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards([litResource]);
    expect(sessionCapabilityObject.attenuations).toStrictEqual({
      [`lit-accesscontrolcondition://${hashedResourceId}`]: {
        '*/*': [{}],
      },
    });
    expect(
      sessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(true);
  });

  it('gets expiration', () => {
    const expiration = LitNodeClientNodeJs.getExpiration();

    expect(expiration).toContain('T');
  });
});
