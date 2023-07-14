import { ethers } from 'ethers';
import { LitDispatch } from '../events';
import { LitAuthMethod, LitAuthMethodWithProvider, PKPInfo } from '../types';
import { getProviderMap, log } from '../utils';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { BaseProvider } from '@lit-protocol/lit-auth-client';

const ADDR = '0x576ee33a2613b9740bA59cf32779E60a9186F226';
const PKEY = '46c45b45cb6a913e104c298bda4bdaaea860aa1349208e9efbb2bb505e5fd0ee';

// const tx = await pkpHelper.mintNextAndAddAuthMethods(
//   2,
//   [authMethodType1, ...., authMethodTypeN],
//   [authMethodId, ...., authMethodIdN],
//   [authMethodPubkey, ...., authMethodPubkeyN],
//   [[ethers.BigNumber.from("0")], ..., [ethers.BigNumber.from("0")N]],
//   true,
//   true,
//   { value: mintCost },
// );

const getLitContracts = async () => {
  const litContracts = new LitContracts({
    privateKey: PKEY,
    debug: true,
  });

  await litContracts.connect();

  let mintCost;

  try {
    mintCost = await litContracts.pkpNftContract.read.mintCost();
  } catch (e) {
    throw new Error('Could not get mint cost');
  }

  log('mintCost', mintCost.toString());

  return { litContracts, mintCost };
};

type AuthKeys =
  | 'ethwallet'
  | 'webauthn'
  | 'discord'
  | 'google'
  | 'otp'
  | 'apple';

export const handleMultiAuths = async (
  authData: LitAuthMethod[]
): Promise<PKPInfo> => {
  log.start('handleMultiAuths', 'handle-multi-auths.ts');

  log.info('authData:', authData);

  const authMethodTypes = authData.map((auth) => auth.authMethodType);

  const authMethodIds = await Promise.all(
    authData.map(async (auth) => {
      const authMethodName = getProviderMap()[
        auth.authMethodType
      ].toLowerCase() as AuthKeys;

      if (authMethodName in globalThis.Lit.auth) {
        const id = await (
          globalThis.Lit.auth[authMethodName] as BaseProvider
        ).getAuthMethodId();
        return id;
      } else {
        throw new Error(`Unsupported auth method: ${authMethodName}`);
      }
    })
  );
  const authMethodIdsArrayish: any[] = authMethodIds.map((id) =>
    ethers.utils.arrayify(id)
  );

  const authMethodPubKeys = authData.map((auth) => {
    const authMethodName = getProviderMap()[
      auth.authMethodType
    ].toLowerCase() as AuthKeys;

    if (authMethodName == 'webauthn' || authMethodName === 'apple') {
      throw new Error(`Unsupported auth method: ${authMethodName}`);
    }

    return null;
  });

  const scopes = authData.map((_) => [ethers.BigNumber.from('0')]);

  log('authMethodTypes', authMethodTypes);
  log('authMethodIds', authMethodIds);
  log('authMethodIdsArrayish', authMethodIdsArrayish);
  log('authMethodPubKeys', authMethodPubKeys);
  log('scopes', scopes);

  LitDispatch.createAccountStatus('in_progress');

  const { litContracts, mintCost } = await getLitContracts();

  let tx;

  try {
    tx = await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
      2,
      authMethodTypes,
      authMethodIdsArrayish,
      authMethodPubKeys as any,
      scopes,
      true,
      true,
      { value: mintCost }
    );
  } catch (e) {
    log.throw(`Failed to create account! ${e}`);
  }

  const res = await tx.wait();

  log.info('res:', res);

  log.end('handleMultiAuths', 'account created successfully!');

  return {} as PKPInfo;
};
