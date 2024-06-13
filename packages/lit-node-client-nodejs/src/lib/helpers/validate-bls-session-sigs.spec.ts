import { blsSessionSigVerify } from './validate-bls-session-sig';

describe('BlsSessionSigVerify', () => {
  const authSig = {
    sig: '{"ProofOfPossession":"ae925162cecb2f572fa76b93372dbbaee0133e89987c33d3210e0d62ca2dd5bf080dbdabb0155e61e770be1a2a629861073acc58fbc16cb6b700088d2aff114c42337c6123c8d15eeee63b522ea7d9c8f44390d3cb7b26e8d4935a283fe72a5d"}',
    algo: 'LIT_BLS',
    derivedVia: 'lit.bls',
    signedMessage:
      'litprotocol.com wants you to sign in with your Ethereum account:\n' +
      '0xf087a967D9eA9445D9182692C2944DcC0Af57341\n' +
      '\n' +
      "Lit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n" +
      '\n' +
      'URI: lit:session:efebafcc9063827a49dffdb11c36b2d64a33330631ac7f5825e2960946bcc8ff\n' +
      'Version: 1\n' +
      'Chain ID: 1\n' +
      'Nonce: 0x1f623ab8dfe6bbd3b3dc22c7a041deb697c14817bce471b1bd1d86a25d5a319c\n' +
      'Issued At: 2024-06-11T15:55:23Z\n' +
      'Expiration Time: 2024-06-12T15:55:47.655Z\n' +
      'Resources:\n' +
      '- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTgyMDc3MzgsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NjEwM2U1MGUyQzA0OWM5MjgxNEE1Mjc1YURDZDlBNzE2NjY3OTUxZSJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119',
    address: '0xf087a967D9eA9445D9182692C2944DcC0Af57341',
  };

  let networkPubKey =
    'a43499a4b786da2dd28af9f209eb152ff6f646b34b68a02954967271e17fb4c511fd67b81e067f690c6f38acab70585d';

  it(`should verify valid bls signatrue`, () => {
    expect(
      blsSessionSigVerify(
        (public_key: any, message: any, signature: any) => {
          expect(typeof public_key).toBe('string');
          expect(typeof message).toBe('string');
          expect(typeof signature).toBe('string');
        },
        networkPubKey,
        authSig
      )
    ).toBeUndefined();
  });
});
