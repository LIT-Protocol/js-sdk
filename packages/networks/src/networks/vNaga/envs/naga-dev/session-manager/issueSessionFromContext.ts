import { InvalidSessionSigs } from '@lit-protocol/constants';
import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
} from '@lit-protocol/schemas';
import {
  LitResourceAbilityRequest,
  SessionSigningTemplate,
  SessionSigsMap,
} from '@lit-protocol/types';
import { ed25519 } from '@noble/curves/ed25519';
import { hexToBytes } from '@noble/hashes/utils';
import { z } from 'zod';
import { getMaxPricesForNodeProduct } from '../pricing-manager/getMaxPricesForNodeProduct';
import { PricingContext } from '../pricing-manager/PricingContextSchema';
import { validateSessionSigs } from './helper/session-sigs-validator';

/**
 * Attempts to normalize a string by unescaping it until it can be parsed as a JSON object,
 * then stringifies it exactly once. If the input is a regular string that does not represent
 * a JSON object or array, the function will return it as is without modification.
 * This function is designed to handle cases where strings might be excessively escaped due
 * to multiple layers of encoding, ensuring that JSON data is stored in a consistent and
 * predictable format, and regular strings are left unchanged.
 *
 * @param input The potentially excessively escaped string.
 * @return A string that is either the JSON.stringify version of the original JSON object
 *         or the original string if it does not represent a JSON object or array.
 */
export function normalizeAndStringify(input: string): string {
  try {
    // Directly return the string if it's not in a JSON format
    if (!input.startsWith('{') && !input.startsWith('[')) {
      return input;
    }

    // Attempt to parse the input as JSON
    const parsed = JSON.parse(input);

    // If parsing succeeds, return the stringified version of the parsed JSON
    return JSON.stringify(parsed);
  } catch (error) {
    // If parsing fails, it might be due to extra escaping
    const unescaped = input.replace(/\\(.)/g, '$1');

    // If unescaping doesn't change the string, return it as is
    if (input === unescaped) {
      return input;
    }

    // Otherwise, recursively call the function with the unescaped string
    return normalizeAndStringify(unescaped);
  }
}

export const issueSessionFromContext = async (params: {
  authContext: z.input<
    typeof PKPAuthContextSchema | typeof EoaAuthContextSchema
  >;
  pricingContext: PricingContext;
  // latestBlockhash: string;
}): Promise<SessionSigsMap> => {
  const authSig = await params.authContext.authNeededCallback();

  const capabilities = [
    ...(params.authContext.authConfig.capabilityAuthSigs || []), // Spreads existing sigs, or an empty array if null/undefined/empty
    authSig,
  ];

  // This is the template that will be combined with the node address as a single object, then signed by the session key
  // so that the node can verify the session signature
  const sessionSigningTemplate = {
    sessionKey: params.authContext.sessionKeyPair.publicKey,
    resourceAbilityRequests: (params.authContext.authConfig.resources ||
      []) as LitResourceAbilityRequest[],
    capabilities: capabilities,
    issuedAt: new Date().toISOString(),

    // @ts-ignore - adding ! because zod schema has a default so this value will never be undefined
    // otherwise, "const toSign" below will throw lint error
    expiration: params.authContext.authConfig.expiration!,
  };

  // console.log('🔄 sessionSigningTemplate', sessionSigningTemplate);

  const sessionSigs: SessionSigsMap = {};

  const _userMaxPrices = getMaxPricesForNodeProduct({
    nodePrices: params.pricingContext.nodePrices,
    userMaxPrice: params.pricingContext.userMaxPrice,

    // @ts-ignore - need to change the MaxPricesForNodes interface
    productId: Number(params.pricingContext.product.id),
    numRequiredNodes: params.pricingContext.threshold,
  });

  // console.log('🔄 _userMaxPrices', _userMaxPrices);

  _userMaxPrices.forEach(({ url: nodeAddress, price }) => {
    const toSign: SessionSigningTemplate = {
      ...sessionSigningTemplate,
      nodeAddress,
      maxPrice: price.toString(),
    };

    // console.log(`Setting maxprice for ${nodeAddress} to `, price.toString());

    const signedMessage = JSON.stringify(toSign);

    const messageHex = new Uint8Array(Buffer.from(signedMessage, 'utf8'));

    const secretKeyBytes = hexToBytes(
      params.authContext.sessionKeyPair.secretKey
    );
    const signature = ed25519.sign(messageHex, secretKeyBytes);

    // one of these is essentially what wrapped key service need.
    sessionSigs[nodeAddress] = {
      sig: Buffer.from(signature).toString('hex'),
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: signedMessage,
      address: params.authContext.sessionKeyPair.publicKey,
      algo: 'ed25519',
    };
  });

  const validatedSessionSigs = validateSessionSigs(sessionSigs);

  if (validatedSessionSigs.isValid === false) {
    throw new InvalidSessionSigs(
      {},
      `Invalid sessionSigs. Errors: ${validatedSessionSigs.errors}`
    );
  }

  // make this only log when debug is enabled
  // if (typeof process !== 'undefined' && process.env['PINO_LOG_LEVEL']) {
  //   console.log(
  //     '💡 PINO_LOG_LEVEL is defined, printing human readable session sigs'
  //   );
  //   console.log(formatSessionSigs(JSON.stringify(sessionSigs)));
  // }

  return sessionSigs;
};
