import {
  AuthSig,
  SessionKeySignedMessage,
  SessionSigsMap,
} from '@lit-protocol/types';

import { CHAIN_ETHEREUM } from './constants';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from './utils';

describe('getFirstSessionSig from sessionSigs record', () => {
  const sessionSigs: SessionSigsMap = {
    'https://207.244.70.36:8474': {
      sig: '1827d1c7b79c979ce76d0b9e130f6804dbf7c7838b6dfa41d4cadf690b9a8bec23321dde6cc573e8a592c395193074ade303d94f3c198d8f0017ca0aca91bd0f',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8474"}`,
      address:
        '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
      algo: 'ed25519',
    },
    'https://207.244.70.36:8473': {
      sig: '762b9849d2cc77d0c75aa354c3cce63abca008a9a07ec3efc69ee8a4954650c3362b8cb83cd3d63310ad98b446be5e68cb8193f9d486453b2df72188dc698d0e',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8473"}`,
      address:
        '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
      algo: 'ed25519',
    },
    'https://207.244.70.36:8475': {
      sig: '5e506dc973cc1540dcb3bd1de251afa687caf277cb5f3efe107339ecf4c25607d4bdf5d8c8910874519252e026a49cc66cea0b07bc5d38342c7cb2613decbe0a',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8475"}`,
      address:
        '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
      algo: 'ed25519',
    },
  };

  it('should correctly extract first sessionSig', () => {
    const firstSessionSig = getFirstSessionSig(sessionSigs);
    const signedMessage: SessionKeySignedMessage = JSON.parse(
      firstSessionSig.signedMessage
    );
    expect(signedMessage.nodeAddress).toEqual('https://207.244.70.36:8474');
  });

  it('should throw an error for empty sessionSigs record', () => {
    expect(() => getFirstSessionSig({})).toThrow(
      'Invalid pkpSessionSigs, length zero: {}'
    );
  });
});

describe('getPkpAddressFromSessionSig from (first) pkpSessionSig', () => {
  const pkpSessionSig: AuthSig = {
    sig: '1827d1c7b79c979ce76d0b9e130f6804dbf7c7838b6dfa41d4cadf690b9a8bec23321dde6cc573e8a592c395193074ade303d94f3c198d8f0017ca0aca91bd0f',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8474"}`,
    address: '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
    algo: 'ed25519',
  };

  it('should correctly extract the pkpAddress from the sessionSig', () => {
    const pkpAddress = getPkpAddressFromSessionSig(pkpSessionSig);
    expect(pkpAddress).toEqual('0xd1Af1AAC50aC837C873200D17b78664aFCde597C');
  });

  it('should throw an error for EOA sessionSig', () => {
    const eoaSessionSigs = {
      sig: '8d2206d0751729d3641568977f7597df21801b8532d838f3c89baee7c82b895431aeeb29ef9f8d519b6c43defcbec46dabd2113a1f231ad87555e2b95c1c9b06',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"4afd2573c82608c54a2c52c77dfbb13595b4f87d93ebc299459a06a7f698b8f1","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0xc941b6762919a17f489c9741e0f56686d706508493dd773381e3bad7f5c9504e7da03f12887f060c208eca80de275d62e3754577ea3b233d2d85c90402aa8f251b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x6c48cc6CE0972a97074bA0d374B7F58E3031fE87\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:4afd2573c82608c54a2c52c77dfbb13595b4f87d93ebc299459a06a7f698b8f1\\nVersion: 1\\nChain ID: 1\\nNonce: 0x6f9c74a3372ac811808d0cfe924dcfdf40155d2f3ae5d462aecf7cc5978ed288\\nIssued At: 2024-06-02T20:45:05.506Z\\nExpiration Time: 2024-06-03T20:45:04.523Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x6c48cc6CE0972a97074bA0d374B7F58E3031fE87"}],"issuedAt":"2024-06-02T20:45:05.564Z","expiration":"2024-06-03T20:45:04.523Z","nodeAddress":"https://207.244.70.36:8474"}`,
      address:
        '4afd2573c82608c54a2c52c77dfbb13595b4f87d93ebc299459a06a7f698b8f1',
      algo: 'ed25519',
    };
    expect(() => getPkpAddressFromSessionSig(eoaSessionSigs)).toThrowError(
      'SessionSig is not from a PKP'
    );
  });
});

describe('getPkpAccessControlCondition', () => {
  it('should correctly create the ACC', () => {
    const pkpAddress = '0xd1Af1AAC50aC837C873200D17b78664aFCde597C';
    const acc = getPkpAccessControlCondition(pkpAddress);
    expect(acc).toEqual([
      {
        contractAddress: '',
        standardContractType: '',
        chain: CHAIN_ETHEREUM,
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: pkpAddress,
        },
      },
    ]);
  });

  it('should throw an error for non-Ethereum address', () => {
    const nonEvmAddress = '24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p';
    expect(() => getPkpAccessControlCondition(nonEvmAddress)).toThrowError(
      `pkpAddress is not a valid Ethereum Address: ${nonEvmAddress}`
    );
  });
});
