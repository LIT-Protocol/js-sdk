import { log } from '@lit-protocol/misc';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpSessionSigsDomain
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpSessionSigsDomain
 * ✅ NETWORK=custom yarn test:local --filter=testPkpSessionSigsDomain
 */
export const testPkpSessionSigsDomain = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();
  const testDomain = 'test.domain.com';

  // AuthNeededCallback props:
  // props: {
  //   chain: 'ethereum',
  //   statement: 'I further authorize the stated URI to perform the following actions on my behalf:',
  //   resources: [ 'urn:recap:eyJhdHQiOnt9LCJwcmYiOltdfQ' ],
  //   expiration: '2025-02-01T16:51:50.358Z',
  //   uri: 'lit:session:e43c4bdff81bb83e7bedf079f5546f237d6e1344c9981735fe8d3a0bbc07c371',
  //   sessionKey: {
  //     publicKey: 'e43c4bdff81bb83e7bedf079f5546f237d6e1344c9981735fe8d3a0bbc07c371',
  //     secretKey: 'a5f43862612394a59f64708a847825255d66839fd6972d3538cb5dffce7228aee43c4bdff81bb83e7bedf079f5546f237d6e1344c9981735fe8d3a0bbc07c371'
  //   },
  //   nonce: '0x53e14ac177c02e4b460432ef2bd639519c589137f16136027505c58793608ef7',
  //   domain: 'test.domain.com',
  //   resourceAbilityRequests: [
  //     { resource: [LitPKPResource], ability: 'pkp-signing' },
  //     { resource: [LitActionResource], ability: 'lit-action-execution' }
  //   ]
  // }
  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    undefined,
    undefined,
    testDomain
  );

  // Get the first session sig to verify
  const firstNodeAddress = Object.keys(pkpSessionSigs)[0];
  const firstSessionSig = pkpSessionSigs[firstNodeAddress];

  // Parse the signed message to verify domain
  const signedMessage = firstSessionSig.signedMessage;

  // Verify that the domain is present in the signed message
  if (!signedMessage.includes(testDomain)) {
    throw new Error(
      `Expected domain "${testDomain}" in signed message, but it was not found. Signed message: ${signedMessage}`
    );
  }

  log('✅ Domain parameter successfully passed through in sessionSigs');

  // Clean up
  devEnv.releasePrivateKeyFromUser(alice);
};
