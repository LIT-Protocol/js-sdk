import { formatSessionSigs, formatSessionSigsJSON } from './session-sigs-reader';

describe('formatSessionSigs', () => {
  it('should format session signatures correctly', () => {
    const sessionSigs = {
      'https://184.107.182.142:443': {
        sig: 'b255b9665541af52215e80f94debee56b3d46431f3b292c54c21b49c9236b800b39c6ec18544a5a80546c2b2216816ca0b989e8ef0bef7e0e429e2645af49b04',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage:
          '{"sessionKey":"85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x5bf4189b3447f8b54bcac05fb3e47713641ca588ac9bf196b993468d45a1dfd456d7e9dff1f86f71db68f47d2c84c8cfe84d81c12fce13396f09e7a301eb19a81c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) \'Auth\': \'Auth\' for \'lit-ratelimitincrease://24353\'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2024-10-04T17:46:42.220Z\\nExpiration Time: 2024-10-11T17:46:42.217Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQzNTMiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyI4MzU1ZjA0NzBlNTU5MDhCMWYwNDY3RTZhMTU3RjY0QjczRkQzQWU2Il0sIm5mdF9pZCI6WyIyNDM1MyJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ","address":"0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1"},{"sig":"{\\"ProofOfPossession\\":\\"abe6ac4c0847f0e1e5453d63623625615b1e26db3f0296f5e6a1450527cf51431dbb671c8983bd6eae299980da84f5220d723af102792fc32e8b72eb01b97611638d9a8fc2e3fcf5c32fb9628e4546f5f56a229108ad0751609c301abb1f2006\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"localhost:5173 wants you to sign in with your Ethereum account:\\n0x8355f0470e55908B1f0467E6a157F64B73FD3Ae6\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) \'Threshold\': \'Execution\' for \'lit-litaction://*\'. (2) \'Threshold\': \'Signing\' for \'lit-pkp://*\'. I further authorize the stated URI to perform the following actions on my behalf: (1) \'Threshold\': \'Execution\' for \'lit-litaction://*\'. (2) \'Threshold\': \'Signing\' for \'lit-pkp://*\'. (3) \'Auth\': \'Auth\' for \'lit-resolvedauthcontext://*\'.\\n\\nURI: lit:session:85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2024-10-04T17:46:23Z\\nExpiration Time: 2024-10-05T17:46:54.631Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZOW11Wm5GMVNOQ1pBSGZQWTZRUU41dlM3ekFGWkhLTGtURTN1b3h0Q3ZlOSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoidHJ1ZSIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0"}],"issuedAt":"2024-10-04T17:46:55.477Z","expiration":"2024-10-05T17:46:54.631Z","nodeAddress":"https://184.107.182.142:443"}',
        address:
          '85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b',
        algo: 'ed25519',
      },
    };

    const currentTime = new Date('2022-01-01T06:00:00Z');
    const formattedSessionSigs = formatSessionSigs(
      JSON.stringify(sessionSigs),
      currentTime
    );

    const expectedOutput = `The request time is at: 2022-01-01T06:00:00.000Z
* Outer expiration:
    * Issued at: 2024-10-04T17:46:55.477Z
    * Expiration: 2024-10-05T17:46:54.631Z
    * Duration: 23 hours, 59 minutes, 59.154 seconds
    * Status: ✅ Not expired (valid for 1008 days)
* Capabilities:
    * Capability 1 (web3.eth.personal.sign):
        * Issued at: 2024-10-04T17:46:42.220Z
        * Expiration: 2024-10-11T17:46:42.217Z
        * Duration: 6 days
        * Status: ✅ Not expired (valid for 1014 days)
    * Capability 2 (lit.bls):
        * Issued at: 2024-10-04T17:46:23.000Z
        * Expiration: 2024-10-05T17:46:54.631Z
        * Duration: 1 days
        * Status: ✅ Not expired (valid for 1008 days)
`;
    expect(formattedSessionSigs).toBe(expectedOutput);
  });

  it('should handle expired session signatures correctly', () => {
    const sessionSigs = {
      'https://184.107.182.142:443': {
        sig: 'b255b9665541af52215e80f94debee56b3d46431f3b292c54c21b49c9236b800b39c6ec18544a5a80546c2b2216816ca0b989e8ef0bef7e0e429e2645af49b04',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage:
          '{"sessionKey":"85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x5bf4189b3447f8b54bcac05fb3e47713641ca588ac9bf196b993468d45a1dfd456d7e9dff1f86f71db68f47d2c84c8cfe84d81c12fce13396f09e7a301eb19a81c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) \'Auth\': \'Auth\' for \'lit-ratelimitincrease://24353\'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2022-10-04T17:46:42.220Z\\nExpiration Time: 2022-10-11T17:46:42.217Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQzNTMiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyI4MzU1ZjA0NzBlNTU5MDhCMWYwNDY3RTZhMTU3RjY0QjczRkQzQWU2Il0sIm5mdF9pZCI6WyIyNDM1MyJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ","address":"0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1"},{"sig":"{\\"ProofOfPossession\\":\\"abe6ac4c0847f0e1e5453d63623625615b1e26db3f0296f5e6a1450527cf51431dbb671c8983bd6eae299980da84f5220d723af102792fc32e8b72eb01b97611638d9a8fc2e3fcf5c32fb9628e4546f5f56a229108ad0751609c301abb1f2006\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"localhost:5173 wants you to sign in with your Ethereum account:\\n0x8355f0470e55908B1f0467E6a157F64B73FD3Ae6\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) \'Threshold\': \'Execution\' for \'lit-litaction://*\'. (2) \'Threshold\': \'Signing\' for \'lit-pkp://*\'. I further authorize the stated URI to perform the following actions on my behalf: (1) \'Threshold\': \'Execution\' for \'lit-litaction://*\'. (2) \'Threshold\': \'Signing\' for \'lit-pkp://*\'. (3) \'Auth\': \'Auth\' for \'lit-resolvedauthcontext://*\'.\\n\\nURI: lit:session:85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2022-10-04T17:46:23Z\\nExpiration Time: 2022-10-05T17:46:54.631Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZOW11Wm5GMVNOQ1pBSGZQWTZRUU41dlM3ekFGWkhLTGtURTN1b3h0Q3ZlOSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoidHJ1ZSIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0"}],"issuedAt":"2022-10-04T17:46:55.477Z","expiration":"2022-10-05T17:46:54.631Z","nodeAddress":"https://184.107.182.142:443"}',
        address:
          '85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b',
        algo: 'ed25519',
      },
    };

    const currentTime = new Date('2024-01-01T06:00:00Z');
    const formattedSessionSigs = formatSessionSigs(
      JSON.stringify(sessionSigs),
      currentTime
    );

    const expectedOutput = `The request time is at: 2024-01-01T06:00:00.000Z
* Outer expiration:
    * Issued at: 2022-10-04T17:46:55.477Z
    * Expiration: 2022-10-05T17:46:54.631Z
    * Duration: 23 hours, 59 minutes, 59.154 seconds
    * Status: ❌ Expired (expired 452 days ago)
* Capabilities:
    * Capability 1 (web3.eth.personal.sign):
        * Issued at: 2022-10-04T17:46:42.220Z
        * Expiration: 2022-10-11T17:46:42.217Z
        * Duration: 6 days
        * Status: ❌ Expired (expired 446 days ago)
    * Capability 2 (lit.bls):
        * Issued at: 2022-10-04T17:46:23.000Z
        * Expiration: 2022-10-05T17:46:54.631Z
        * Duration: 1 days
        * Status: ❌ Expired (expired 452 days ago)
`;
    expect(formattedSessionSigs).toBe(expectedOutput);
  });
});


describe('formatSessionSigsJson', () => {

  const sessionSigs = {
    'https://178.162.172.88:443': {
      sig: 'd8d1311def1e6bfa2dd8ec79fee7f7ba3e770e1b0f2841c13db2a3196febf47b857c48575fd8f2a478c0364cffa9d478f0b0479c784b04f010f0f6fc97a61f09',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://178.162.172.88:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://104.245.147.218:443': {
      sig: 'f4133963d987cebb05d889488865237e28ee29d86e5de7f0f08b07eb246c6e614a8ac2042431ad5cb8944f9583556838fdfe8d200ba86e620a5351d37119b705',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://104.245.147.218:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://184.107.182.142:443': {
      sig: 'ae98fca36a1059cd5cbe7578ff94f777cb89e5fb642f8e5e709328e8a2753768925bf203650fcde83a8691e6e2bee1dc80b6fd71714a1c5d1d7f06d6356b1a0a',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://184.107.182.142:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://23.82.129.77:443': {
      sig: 'e666f0bac0633a2d262e252cfa5d7746084f32a9c75e79a8ed9781a73fde1767c999d1e7898432f3653867ef182a17f013810c5b2d85e87ab0695b7b5cf63b0c',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://23.82.129.77:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://199.115.115.103:443': {
      sig: '887bfe8581c9e50915638d796c10da8560e2a76f29dd83283efb0654ca6375add37dec073ef25ec74dfd9215ad4a37b3bfdf407579fe987154fabd95bff20b0f',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://199.115.115.103:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://207.244.66.41:443': {
      sig: '37f4e81fb4a410335b322331f49d43a02d38c893042e2a580fcffe781ea17db7ad0b2d83f36afdeb84968d4901f4a47eef02484ed14adbb301c45fc8937bf400',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://207.244.66.41:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://173.208.0.151:443': {
      sig: '12496182e7b323943bcea9e0e342d6caee961137c9852dc063ac46ee20705b3f8a70e144249f3fe04d290bf7318f43d1cb641d472894954cdc8f784d333b5300',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://173.208.0.151:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    },
    'https://207.244.90.225:443': {
      sig: 'da675ce1b939511714116c73c32dec32db60abc42fa596cf4a82e4eeddc4531d85fb15758e4c78db83f990a892f07782a825e459022817d4098a65b736e9d900',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"838cf437fa58c2bb7e5c183bd2b184e4ed9da595bdb9bffa34019ca9b47e93f64b83d464eb9237297a829d1aa333560b0d6c55910631334bd9249cc826f8dcbf202f5f2d7d1ec67ec894a0b36b616cabb74f3e582e8b37089b9abdabbfa17e0d\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0\\nVersion: 1\\nChain ID: 1\\nNonce: 0x244bc2b37cf85c94f37206c2ca0769db6bd353f2795f5b6894829068ad8c8542\\nIssued At: 2024-10-11T18:59:23Z\\nExpiration Time: 2024-10-12T18:59:52.424Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1kNWliQ1JvOURoRW5qY21mQnNNVTZxUkJDdk1DWnc1a0I3b1N2Q2E3aVhEUiJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoiKHRydWUsICdBbnl0aGluZyB5b3VyIHdhbnQgdG8gdXNlIGluIGV4ZWN1dGVKcycpIiwicmVzb3VyY2VzIjpbXX19XX19LCJwcmYiOltdfQ","address":"0xa19355DD0C6aDfD02a0F8C2B70A26DF4cECea166"}],"issuedAt":"2024-10-11T18:59:53.489Z","expiration":"2024-10-12T18:59:52.424Z","nodeAddress":"https://207.244.90.225:443"}`,
      address: '09f07199ad48addc9b582cd4d1dd29014c61706b665474a5d10ee3903b2571a0',
      algo: 'ed25519'
    }
  };

  it('should format session signatures correctly', () => {
    const formattedSessionSigsJson = formatSessionSigsJSON(JSON.stringify(sessionSigs));


    console.log('formattedSessionSigsJson', formattedSessionSigsJson);

  });
})