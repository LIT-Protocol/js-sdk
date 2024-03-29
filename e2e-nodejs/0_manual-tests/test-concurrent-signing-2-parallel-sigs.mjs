import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { ethers } from 'ethers';

// NOTE: you need to hash data before you send it in.
// If you send something that isn't 32 bytes, the nodes will return an error.
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

export async function main() {
  // ==================== Test Logic ====================
  let results = await Promise.all([
    (async () => {
      console.time('request 1');
      let res = await client.executeJs({
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        code: `(async () => {
                console.log('hello world')
          
                async function signMultipleSigs(numSigs, toSign, publicKey) {
                  const sigShares = [];
                  for(let i = 0; i < numSigs; i++) {
                    const sigShare = await LitActions.signEcdsa({
                      toSign,
                      publicKey,
                      sigName: "sig" + i,
                    });
                    sigShares.push(sigShare);
                  }
                  return sigShares;
                }
          
                const sigShares = await signMultipleSigs(numberOfSigs, dataToSign, publicKey);
            })();`,
        authMethods: [],
        jsParams: {
          numberOfSigs: 2,
          dataToSign: TO_SIGN,
          publicKey: globalThis.LitCI.PKP_INFO.publicKey,
        },
      });
      console.timeEnd('request 1');
      return res;
    })(),
    (async () => {
      console.time('request 2');
      let res = await client.executeJs({
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        code: `(async () => {
                console.log('hello world')
          
                async function signMultipleSigs(numSigs, toSign, publicKey) {
                  const sigShares = [];
                  for(let i = 0; i < numSigs; i++) {
                    const sigShare = await LitActions.signEcdsa({
                      toSign,
                      publicKey,
                      sigName: "sig" + i,
                    });
                    sigShares.push(sigShare);
                  }
                  return sigShares;
                }
          
                const sigShares = await signMultipleSigs(numberOfSigs, dataToSign, publicKey);
            })();`,
        authMethods: [],
        jsParams: {
          numberOfSigs: 2,
          dataToSign: TO_SIGN,
          publicKey: globalThis.LitCI.PKP_INFO.publicKey,
        },
      });
      console.timeEnd('request 2');
      return res;
    })(),
    (async () => {
      console.time('request 3');
      let res = await client.executeJs({
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        code: `(async () => {
                console.log('hello world')
          
                async function signMultipleSigs(numSigs, toSign, publicKey) {
                  const sigShares = [];
                  for(let i = 0; i < numSigs; i++) {
                    const sigShare = await LitActions.signEcdsa({
                      toSign,
                      publicKey,
                      sigName: "sig" + i,
                    });
                    sigShares.push(sigShare);
                  }
                  return sigShares;
                }
          
                const sigShares = await signMultipleSigs(numberOfSigs, dataToSign, publicKey);
            })();`,
        authMethods: [],
        jsParams: {
          numberOfSigs: 2,
          dataToSign: TO_SIGN,
          publicKey: globalThis.LitCI.PKP_INFO.publicKey,
        },
      });
      console.timeEnd('request 3');
      return res;
    })(),
    (async () => {
      console.time('request 4');
      let res = await client.executeJs({
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        code: `(async () => {
                console.log('hello world')
          
                async function signMultipleSigs(numSigs, toSign, publicKey) {
                  const sigShares = [];
                  for(let i = 0; i < numSigs; i++) {
                    const sigShare = await LitActions.signEcdsa({
                      toSign,
                      publicKey,
                      sigName: "sig" + i,
                    });
                    sigShares.push(sigShare);
                  }
                  return sigShares;
                }
          
                const sigShares = await signMultipleSigs(numberOfSigs, dataToSign, publicKey);
            })();`,
        authMethods: [],
        jsParams: {
          numberOfSigs: 2,
          dataToSign: TO_SIGN,
          publicKey: globalThis.LitCI.PKP_INFO.publicKey,
        },
      });
      console.timeEnd('request 4');
      return res;
    })(),
    (async () => {
      console.time('request 5');
      let res = await client.executeJs({
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        code: `(async () => {
                console.log('hello world')
          
                async function signMultipleSigs(numSigs, toSign, publicKey) {
                  const sigShares = [];
                  for(let i = 0; i < numSigs; i++) {
                    const sigShare = await LitActions.signEcdsa({
                      toSign,
                      publicKey,
                      sigName: "sig" + i,
                    });
                    sigShares.push(sigShare);
                  }
                  return sigShares;
                }
          
                const sigShares = await signMultipleSigs(numberOfSigs, dataToSign, publicKey);
            })();`,
        authMethods: [],
        jsParams: {
          numberOfSigs: 2,
          dataToSign: TO_SIGN,
          publicKey: globalThis.LitCI.PKP_INFO.publicKey,
        },
      });
      console.timeEnd('request 5');
      return res;
    })(),
  ]);
  // ==================== Post-Validation ====================
  for (const res of results) {
    Object.entries(res.signatures).forEach(([key, sig]) => {
      if (key !== 'sig0' && key !== 'sig1') {
        return fail(`sig name ${key} is not expected`);
      }

      ['r', 's', 'recid', 'signature', 'publicKey', 'dataSigned'].forEach(
        (key) => {
          if (sig[key] === undefined) {
            return fail(`sig.${key} is undefined, empty, or null`);
          }
        }
      );
    });
  }

  // ==================== Success ====================
  return success('Lit Action should log sign x1 sig in parallel');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
