import { getBlsSignatures } from './get-bls-signatures';

describe('getBlsSignatures', () => {
  it('should return an array of signed data', () => {
    const responseData = [
      {
        result: 'success',
        signatureShare: {
          ProofOfPossession:
            '01b191b1d281857a95d2fd189683db366ab1088723338c1805daa4650459e9fcaebaa57b58108c284d233404dd5f2e58f208aafb87d981098aba3fe850980184a4b29643a21107b03f1d928646245b57af3745a81418989e0b6aad9bd1f192723c',
        },
        shareIndex: 0,
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
          ProofOfPossession:
            '038178034edcd5b48da4e2af6eb0891ece41389aa6119c80546d3fa00b5d2ba87eaec327b18d8013714b486246807498c8198e70cf8e917b1a5f1d8d0846787172521d41994de95bd641bdc1d9ccee9b459ceeb03f156cf357a4ff8faf5d2e167d',
        },
        shareIndex: 2,
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
          ProofOfPossession:
            '0292a026325a166398b85b53f3a7a34d147c5337e189d75c33c0f227f7926c839b408dfcc5d242a8685a81c68e0ccedc080c051219161dbc37f06627259b19d15120ab2f710075a44b1dcef18d511bb99b6625c8f575d2688c6b5b01ba6bf448c9',
        },
        shareIndex: 1,
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
        ProofOfPossession:
          '01b191b1d281857a95d2fd189683db366ab1088723338c1805daa4650459e9fcaebaa57b58108c284d233404dd5f2e58f208aafb87d981098aba3fe850980184a4b29643a21107b03f1d928646245b57af3745a81418989e0b6aad9bd1f192723c',
      },
      {
        ProofOfPossession:
          '038178034edcd5b48da4e2af6eb0891ece41389aa6119c80546d3fa00b5d2ba87eaec327b18d8013714b486246807498c8198e70cf8e917b1a5f1d8d0846787172521d41994de95bd641bdc1d9ccee9b459ceeb03f156cf357a4ff8faf5d2e167d',
      },
      {
        ProofOfPossession:
          '0292a026325a166398b85b53f3a7a34d147c5337e189d75c33c0f227f7926c839b408dfcc5d242a8685a81c68e0ccedc080c051219161dbc37f06627259b19d15120ab2f710075a44b1dcef18d511bb99b6625c8f575d2688c6b5b01ba6bf448c9',
      },
    ]);
  });
});
