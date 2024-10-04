import { formatSessionSigs } from './session-sigs-reader';

describe('formatSessionSigs', () => {

  it('should format session signatures correctly', () => {

    const sessionSigs = {
      "https://184.107.182.142:443": {
        "sig": "b255b9665541af52215e80f94debee56b3d46431f3b292c54c21b49c9236b800b39c6ec18544a5a80546c2b2216816ca0b989e8ef0bef7e0e429e2645af49b04",
        "derivedVia": "litSessionSignViaNacl",
        "signedMessage": "{\"sessionKey\":\"85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b\",\"resourceAbilityRequests\":[{\"resource\":{\"resource\":\"*\",\"resourcePrefix\":\"lit-pkp\"},\"ability\":\"pkp-signing\"},{\"resource\":{\"resource\":\"*\",\"resourcePrefix\":\"lit-litaction\"},\"ability\":\"lit-action-execution\"}],\"capabilities\":[{\"sig\":\"0x5bf4189b3447f8b54bcac05fb3e47713641ca588ac9bf196b993468d45a1dfd456d7e9dff1f86f71db68f47d2c84c8cfe84d81c12fce13396f09e7a301eb19a81c\",\"derivedVia\":\"web3.eth.personal.sign\",\"signedMessage\":\"localhost wants you to sign in with your Ethereum account:\\n0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24353'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2024-10-04T17:46:42.220Z\\nExpiration Time: 2024-10-11T17:46:42.217Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQzNTMiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyI4MzU1ZjA0NzBlNTU5MDhCMWYwNDY3RTZhMTU3RjY0QjczRkQzQWU2Il0sIm5mdF9pZCI6WyIyNDM1MyJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ\",\"address\":\"0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\"},{\"sig\":\"{\\\"ProofOfPossession\\\":\\\"abe6ac4c0847f0e1e5453d63623625615b1e26db3f0296f5e6a1450527cf51431dbb671c8983bd6eae299980da84f5220d723af102792fc32e8b72eb01b97611638d9a8fc2e3fcf5c32fb9628e4546f5f56a229108ad0751609c301abb1f2006\\\"}\",\"algo\":\"LIT_BLS\",\"derivedVia\":\"lit.bls\",\"signedMessage\":\"localhost:5173 wants you to sign in with your Ethereum account:\\n0x8355f0470e55908B1f0467E6a157F64B73FD3Ae6\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2024-10-04T17:46:23Z\\nExpiration Time: 2024-10-05T17:46:54.631Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZOW11Wm5GMVNOQ1pBSGZQWTZRUU41dlM3ekFGWkhLTGtURTN1b3h0Q3ZlOSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoidHJ1ZSIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0\"}],\"issuedAt\":\"2024-10-04T17:46:55.477Z\",\"expiration\":\"2024-10-05T17:46:54.631Z\",\"nodeAddress\":\"https://184.107.182.142:443\"}",
        "address": "85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b",
        "algo": "ed25519"
      }
    }

    const currentTime = new Date('2022-01-01T06:00:00Z');
    const formattedSessionSigs = formatSessionSigs(JSON.stringify(sessionSigs), currentTime);

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
      "https://184.107.182.142:443": {
        "sig": "b255b9665541af52215e80f94debee56b3d46431f3b292c54c21b49c9236b800b39c6ec18544a5a80546c2b2216816ca0b989e8ef0bef7e0e429e2645af49b04",
        "derivedVia": "litSessionSignViaNacl",
        "signedMessage": "{\"sessionKey\":\"85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b\",\"resourceAbilityRequests\":[{\"resource\":{\"resource\":\"*\",\"resourcePrefix\":\"lit-pkp\"},\"ability\":\"pkp-signing\"},{\"resource\":{\"resource\":\"*\",\"resourcePrefix\":\"lit-litaction\"},\"ability\":\"lit-action-execution\"}],\"capabilities\":[{\"sig\":\"0x5bf4189b3447f8b54bcac05fb3e47713641ca588ac9bf196b993468d45a1dfd456d7e9dff1f86f71db68f47d2c84c8cfe84d81c12fce13396f09e7a301eb19a81c\",\"derivedVia\":\"web3.eth.personal.sign\",\"signedMessage\":\"localhost wants you to sign in with your Ethereum account:\\n0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24353'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2022-10-04T17:46:42.220Z\\nExpiration Time: 2022-10-11T17:46:42.217Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQzNTMiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyI4MzU1ZjA0NzBlNTU5MDhCMWYwNDY3RTZhMTU3RjY0QjczRkQzQWU2Il0sIm5mdF9pZCI6WyIyNDM1MyJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ\",\"address\":\"0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\"},{\"sig\":\"{\\\"ProofOfPossession\\\":\\\"abe6ac4c0847f0e1e5453d63623625615b1e26db3f0296f5e6a1450527cf51431dbb671c8983bd6eae299980da84f5220d723af102792fc32e8b72eb01b97611638d9a8fc2e3fcf5c32fb9628e4546f5f56a229108ad0751609c301abb1f2006\\\"}\",\"algo\":\"LIT_BLS\",\"derivedVia\":\"lit.bls\",\"signedMessage\":\"localhost:5173 wants you to sign in with your Ethereum account:\\n0x8355f0470e55908B1f0467E6a157F64B73FD3Ae6\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b\\nVersion: 1\\nChain ID: 1\\nNonce: 0x525df2ace4421a53c2e237f22e1632d8d98fd3bd9ceed2cbb55ec0e2807ef68c\\nIssued At: 2022-10-04T17:46:23Z\\nExpiration Time: 2022-10-05T17:46:54.631Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZOW11Wm5GMVNOQ1pBSGZQWTZRUU41dlM3ekFGWkhLTGtURTN1b3h0Q3ZlOSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOltdLCJhdXRoU2lnQWRkcmVzcyI6bnVsbCwiY3VzdG9tQXV0aFJlc291cmNlIjoidHJ1ZSIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0\"}],\"issuedAt\":\"2022-10-04T17:46:55.477Z\",\"expiration\":\"2022-10-05T17:46:54.631Z\",\"nodeAddress\":\"https://184.107.182.142:443\"}",
        "address": "85a6d21d91d95f7e4c849d73ae0dc1f80e8d5a3a2a6334c73c683817bdb89c0b",
        "algo": "ed25519"
      }
    }

    const currentTime = new Date('2024-01-01T06:00:00Z');
    const formattedSessionSigs = formatSessionSigs(JSON.stringify(sessionSigs), currentTime);

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
