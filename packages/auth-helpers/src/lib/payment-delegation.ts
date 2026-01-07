import { ethers } from 'ethers';

import { InvalidArgumentException, LIT_ABILITY } from '@lit-protocol/constants';
import {
  AuthSig,
  PaymentDelegationAuthSigData,
  PaymentDelegationAuthSigParams,
  PaymentDelegationScope,
} from '@lit-protocol/types';

import { generateAuthSig, generateAuthSigWithViem } from './generate-auth-sig';
import { LitPaymentDelegationResource } from './resources';
import { createSiweMessage } from './siwe/create-siwe-message';

const PAYMENT_DELEGATION_SCOPES = new Set<PaymentDelegationScope>([
  'encryption_sign',
  'lit_action',
  'pkp_sign',
  'sign_session_key',
]);

type ViemSigner = Parameters<typeof generateAuthSigWithViem>[0]['account'];

const normalizeDelegateeAddresses = (delegateeAddresses: string[]) => {
  return delegateeAddresses.map((address) => {
    if (!address || typeof address !== 'string') {
      throw new InvalidArgumentException(
        { info: { delegateeAddresses } },
        'delegateeAddresses must be a non-empty array of strings'
      );
    }

    const trimmed = address.trim();
    const prefixed = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
    const checksummed = ethers.utils.getAddress(prefixed);

    return checksummed.toLowerCase().replace(/^0x/, '');
  });
};

const normalizeScopes = (scopes: PaymentDelegationScope[]) => {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    throw new InvalidArgumentException(
      { info: { scopes } },
      'scopes must be a non-empty array'
    );
  }

  const normalizedScopes = Array.from(new Set(scopes));

  for (const scope of normalizedScopes) {
    if (!PAYMENT_DELEGATION_SCOPES.has(scope)) {
      throw new InvalidArgumentException(
        { info: { scope } },
        `Unsupported payment delegation scope: ${scope}`
      );
    }
  }

  return normalizedScopes;
};

const normalizeMaxPrice = (maxPrice: PaymentDelegationAuthSigParams['maxPrice']) => {
  if (maxPrice === null || maxPrice === undefined) {
    throw new InvalidArgumentException(
      { info: { maxPrice } },
      'maxPrice is required'
    );
  }

  if (typeof maxPrice === 'bigint') {
    if (maxPrice < 0n) {
      throw new InvalidArgumentException(
        { info: { maxPrice } },
        'maxPrice must be non-negative'
      );
    }
    return maxPrice.toString(16);
  }

  if (typeof maxPrice === 'number') {
    if (!Number.isFinite(maxPrice) || maxPrice < 0) {
      throw new InvalidArgumentException(
        { info: { maxPrice } },
        'maxPrice must be a finite, non-negative number'
      );
    }
    return BigInt(Math.trunc(maxPrice)).toString(16);
  }

  const trimmed = maxPrice.trim();
  if (trimmed.length === 0) {
    throw new InvalidArgumentException(
      { info: { maxPrice } },
      'maxPrice must not be empty'
    );
  }

  if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
    return trimmed.slice(2).toLowerCase();
  }

  if (/^[0-9]+$/.test(trimmed)) {
    return BigInt(trimmed).toString(16);
  }

  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  throw new InvalidArgumentException(
    { info: { maxPrice } },
    'maxPrice must be a hex or decimal string'
  );
};

const resolveSignerAddress = async (params: PaymentDelegationAuthSigParams) => {
  if (params.signerAddress) {
    const prefixed = params.signerAddress.startsWith('0x')
      ? params.signerAddress
      : `0x${params.signerAddress}`;
    return ethers.utils.getAddress(prefixed);
  }

  if ('getAddress' in params.signer && typeof params.signer.getAddress === 'function') {
    return ethers.utils.getAddress(await params.signer.getAddress());
  }

  if (
    'address' in params.signer &&
    typeof (params.signer as { address?: string }).address === 'string'
  ) {
    return ethers.utils.getAddress((params.signer as { address: string }).address);
  }

  throw new InvalidArgumentException(
    { info: { signer: params.signer } },
    'signerAddress is required when signer does not expose an address'
  );
};

export const createPaymentDelegationAuthSig = async (
  params: PaymentDelegationAuthSigParams
): Promise<AuthSig> => {
  if (!params.signer) {
    throw new InvalidArgumentException(
      { info: { signer: params.signer } },
      'signer is required'
    );
  }

  if (!params.nonce) {
    throw new InvalidArgumentException(
      { info: { nonce: params.nonce } },
      'nonce is required'
    );
  }

  if (!params.delegateeAddresses || params.delegateeAddresses.length === 0) {
    throw new InvalidArgumentException(
      { info: { delegateeAddresses: params.delegateeAddresses } },
      'delegateeAddresses must be provided'
    );
  }

  const signerAddress = await resolveSignerAddress(params);
  const delegateeAddresses = normalizeDelegateeAddresses(
    params.delegateeAddresses
  );
  const scopes = normalizeScopes(params.scopes);
  const maxPrice = normalizeMaxPrice(params.maxPrice);

  const data: PaymentDelegationAuthSigData = {
    delegate_to: delegateeAddresses,
    max_price: maxPrice,
    scopes,
  };

  const siweMessage = await createSiweMessage({
    walletAddress: signerAddress,
    nonce: params.nonce,
    expiration: params.expiration,
    domain: params.domain,
    statement: params.statement,
    uri: 'lit:capability:delegation',
    resources: [
      {
        resource: new LitPaymentDelegationResource('*'),
        ability: LIT_ABILITY.PaymentDelegation,
        data,
      },
    ],
  });

  if (
    !('getAddress' in params.signer) &&
    'address' in params.signer &&
    typeof (params.signer as { address?: string }).address === 'string'
  ) {
    return generateAuthSigWithViem({
      account: params.signer as ViemSigner,
      toSign: siweMessage,
      address: signerAddress,
    });
  }

  return generateAuthSig({
    signer: params.signer,
    toSign: siweMessage,
    address: signerAddress,
  });
};

export { PAYMENT_DELEGATION_SCOPES };
