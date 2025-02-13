import { getBlsSignatures } from './get-bls-signatures';

describe('getBlsSignatures', () => {
  it('should return an array of signed data', () => {
    const responseData = [
      {
        result: 'success',
        signatureShare: {
          ProofOfPossession: {
            identifier:
              '0d7c3c5d7578af7d20cb3d52059de204b07eb164092c8107df3914d4bfabe647',
            value:
              'a2204142962f7d35b2e18f16f5880e0092a3765e3b595ea437687cd88a04916dcfc2fd55b43f335949e2023071153abf0bfbc28b46ec13a3790c2639a2f40b517c2358996c31e11669f24442c650faaf4af166dde3c325fe9565ecf6872c85b4',
          },
        },
        curveType: 'BLS',
        siweMessage:
          "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
        dataSigned:
          'b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5',
        blsRootPubkey:
          'a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902',
      },
      {
        result: 'success',
        signatureShare: {
          ProofOfPossession: {
            identifier:
              '46cd21a0d05fdd76f0640d4d9353c297eec75d7644723da318a9bfe19f9c2863',
            value:
              'a74ba6452138869712fb7a9c109fc6bda1b587f046adc9b23289f6aadefb127dbb2ec3667c23ce40f0447405bcd19bed04cdd046166d6726b60e342dafdfeca21e0d2e15ad23d11c2b7785d7790278929a974ed02f892169e4a7e4fd99781790',
          },
        },
        curveType: 'BLS',
        siweMessage:
          "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
        dataSigned:
          'b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5',
        blsRootPubkey:
          'a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902',
      },
      {
        result: 'success',
        signatureShare: {
          ProofOfPossession: {
            identifier:
              'd5595f162d312545ea6d58efa6a9430801f229b0a088dab8267f8b722da5d658',
            value:
              '845bdefd8aa0ca99bd587062253eb6bbabbe55153ecaeb52c6ac9d29b29f2d2fd9d9a9e193fdd3bb1b23e9f31dff290d0dc9a1aab8c74f78f99add32e49b3fd9b7626f12dc852d442978c70fd3e684638d782e4aeca1981ce80fb03d64f46563',
          },
        },
        curveType: 'BLS',
        siweMessage:
          "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
        dataSigned:
          'b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5',
        blsRootPubkey:
          'a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902',
      },
    ] as any;

    const result = getBlsSignatures(responseData);

    expect(result).toEqual([
      {
        ProofOfPossession: {
          identifier:
            '0d7c3c5d7578af7d20cb3d52059de204b07eb164092c8107df3914d4bfabe647',
          value:
            'a2204142962f7d35b2e18f16f5880e0092a3765e3b595ea437687cd88a04916dcfc2fd55b43f335949e2023071153abf0bfbc28b46ec13a3790c2639a2f40b517c2358996c31e11669f24442c650faaf4af166dde3c325fe9565ecf6872c85b4',
        },
      },
      {
        ProofOfPossession: {
          identifier:
            '46cd21a0d05fdd76f0640d4d9353c297eec75d7644723da318a9bfe19f9c2863',
          value:
            'a74ba6452138869712fb7a9c109fc6bda1b587f046adc9b23289f6aadefb127dbb2ec3667c23ce40f0447405bcd19bed04cdd046166d6726b60e342dafdfeca21e0d2e15ad23d11c2b7785d7790278929a974ed02f892169e4a7e4fd99781790',
        },
      },
      {
        ProofOfPossession: {
          identifier:
            'd5595f162d312545ea6d58efa6a9430801f229b0a088dab8267f8b722da5d658',
          value:
            '845bdefd8aa0ca99bd587062253eb6bbabbe55153ecaeb52c6ac9d29b29f2d2fd9d9a9e193fdd3bb1b23e9f31dff290d0dc9a1aab8c74f78f99add32e49b3fd9b7626f12dc852d442978c70fd3e684638d782e4aeca1981ce80fb03d64f46563',
        },
      },
    ]);
  });
});
