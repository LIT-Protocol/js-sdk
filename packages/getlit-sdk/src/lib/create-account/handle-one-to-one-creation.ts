import { ProviderType } from '@lit-protocol/constants';
import { LitCredential, PKPInfo } from '../types';
import { getDerivedAddresses, getProviderMap, log } from '../utils';

export async function handleOneToOneCreation(credential: LitCredential) {
  const providerMap = getProviderMap();
  const authMethodType: ProviderType = providerMap[credential.authMethodType];

  const provider = globalThis.Lit.authClient?.getProvider(authMethodType);

  if (!provider) {
    return log.throw(`provider ${authMethodType} is not supported`);
  }

  const txHash = await provider.mintPKPThroughRelayer(credential);

  const response = await provider.relay.pollRequestUntilTerminalState(txHash);

  log.info('response', response);

  if (
    response.status !== 'Succeeded' ||
    !response.pkpPublicKey ||
    !response.pkpTokenId ||
    !response.pkpEthAddress
  ) {
    return log.throw('failed to mint PKP');
  }

  const derivedAddresses = getDerivedAddresses(response.pkpPublicKey);

  if (!derivedAddresses.btcAddress || !derivedAddresses.cosmosAddress) {
    return log.throw('failed to derive addresses');
  }

  const _PKPInfo: PKPInfo = {
    tokenId: response.pkpTokenId,
    publicKey: response.pkpPublicKey,
    ethAddress: response.pkpEthAddress,
    ...derivedAddresses,
  };

  return _PKPInfo;
}
