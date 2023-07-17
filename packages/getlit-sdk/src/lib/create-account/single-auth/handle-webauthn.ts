import { PKPInfo } from '../../types';
import { log, relayResToPKPInfo } from '../../utils';

export const handleWebAuthn = async (): Promise<PKPInfo> => {
  globalThis.Lit.eventEmitter?.createAccountStatus('in_progress');
  log.start('handleProvider', 'handle-provider.ts');

  let opts;
  let txHash;
  let res;

  // -- register
  try {
    opts = await globalThis.Lit.auth.webauthn?.register();
    log('opts', opts);
  } catch (e) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`Failed to create account with webauthn!`);
  }

  if (!opts) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`opts "${opts}" is undefined!`);
  }

  // -- verify hash
  try {
    txHash = await globalThis.Lit.auth.webauthn?.verifyAndMintPKPThroughRelayer(
      opts
    );
    log('txHash', txHash);
  } catch (e) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`Failed to create account with webauthn!`);
  }

  if (!txHash) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`txHash "${txHash}" is undefined!`);
  }

  // -- wait for response
  try {
    res =
      await globalThis.Lit.auth.webauthn?.relay.pollRequestUntilTerminalState(
        txHash
      );
  } catch (e) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`Failed to create account with webauthn!`);
  }

  if (!res) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`res "${res}" is undefined!`);
  }

  const PKPInfo: PKPInfo = relayResToPKPInfo(res);
  globalThis.Lit.eventEmitter?.createAccountStatus('completed', [PKPInfo]);

  log.end('handleProvider', 'handle-provider.ts');

  // return promise
  return new Promise((resolve) => {
    resolve(PKPInfo);
  });
};
