import { InvalidSessionSigs } from '@lit-protocol/constants';
import { SessionSigningTemplate, SessionSigsMap } from '@lit-protocol/types';
import { ed25519 } from '@noble/curves/ed25519';
import { hexToBytes } from '@noble/hashes/utils';
import { z } from 'zod';
import { getMaxPricesForNodeProduct } from '../pricing-manager/getMaxPricesForNodeProduct';
import { PricingContext } from '../pricing-manager/PricingContextSchema';
import { AuthContextSchema } from './AuthContextSchema';
import { formatSessionSigs } from './helper/session-sigs-reader';
import { validateSessionSigs } from './helper/session-sigs-validator';

export const createJitSessionSigs = async (params: {
  authContext: z.input<typeof AuthContextSchema>;
  pricingContext: PricingContext;
  // latestBlockhash: string;
}): Promise<SessionSigsMap> => {
  // console.log('🔄 creating jit session sigs');

  // -- prepare context
  // lit:session:<session-key-public-key>
  // const _sessionKeyUri = SessionKeyUriSchema.parse(
  //   params.authContext.sessionKeyPair.publicKey
  // );
  // const _sessionCapabilityObject = params.authContext.sessionCapabilityObject;
  // const _expiration = params.authContext.authConfig.expiration;

  // -- get authsig
  // const body = {
  //   chain: params.authContext.chain,
  //   statement: params.authContext.sessionCapabilityObject.statement,
  //   resources: params.authContext.siweResources,
  //   expiration: params.authContext.authConfig.expiration,
  //   uri: SessionKeyUriSchema.parse(params.authContext.sessionKeyPair.publicKey),
  //   sessionKey: params.authContext.sessionKeyPair,
  //   nonce: params.latestBlockhash,

  //   // for recap
  //   ...(params.authContext.resourceAbilityRequests && {
  //     resourceAbilityRequests: params.authContext.resourceAbilityRequests,
  //   }),

  //   // for lit action custom auth
  //   // ...(litActionCode && { litActionCode }),
  //   // ...(litActionIpfsId && { litActionIpfsId }),
  //   // ...(jsParams && { jsParams }),
  // };

  // console.log('🔄 body', body);

  const authSig = await params.authContext.authNeededCallback();

  // console.log('🔄 authSig', authSig);

  const capabilities = [
    ...(params.authContext.capabilityAuthSigs || []), // Spreads existing sigs, or an empty array if null/undefined/empty
    authSig,
  ];

  // console.log('🔄 capabilities', capabilities);

  // This is the template that will be combined with the node address as a single object, then signed by the session key
  // so that the node can verify the session signature
  const sessionSigningTemplate = {
    sessionKey: params.authContext.sessionKeyPair.publicKey,
    resourceAbilityRequests: params.authContext.resourceAbilityRequests,
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

    sessionSigs[nodeAddress] = {
      sig: Buffer.from(signature).toString('hex'),
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: signedMessage,
      address: params.authContext.sessionKeyPair.publicKey,
      algo: 'ed25519',
    };
  });

  // console.log('🔄 sessionSigs', sessionSigs);

  const validatedSessionSigs = validateSessionSigs(sessionSigs);

  if (validatedSessionSigs.isValid === false) {
    throw new InvalidSessionSigs(
      {},
      `Invalid sessionSigs. Errors: ${validatedSessionSigs.errors}`
    );
  }

  // make this only log when debug is enabled
  if (typeof process !== 'undefined' && process.env['PINO_LOG_LEVEL']) {
    console.log(
      '💡 PINO_LOG_LEVEL is defined, printing human readable session sigs'
    );
    console.log(formatSessionSigs(JSON.stringify(sessionSigs)));
  }

  return sessionSigs;
};
