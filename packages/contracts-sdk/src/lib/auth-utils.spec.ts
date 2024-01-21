import { getEthAuthMethodId, isSessionSigs } from './auth-utils';
describe('auth-utils', () => {
  it('should return the correct auth method id for eth wallet', () => {

    const authSig = {
      "sig": "0x137b66529678d1fc58ab5b340ad036082af5b9912f823ba22c2851b8f50990a666ad8f2ab2328e8c94414c0a870163743bde91a5f96e9f967fd45d5e0c17c3911b",
      "derivedVia": "web3.eth.personal.sign",
      "signedMessage": "localhost wants you to sign in with your Ethereum account:\n0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37\n\nTESTING TESTING 123\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: eoeo0dsvyLL2gcHsC\nIssued At: 2023-11-17T15:04:20.324Z\nExpiration Time: 2215-07-14T15:04:20.323Z",
      "address": "0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37"
    };

    const authMethod = {
      "authMethodType": 1,
      "accessToken": JSON.stringify(authSig),
    };

    const authId = getEthAuthMethodId(authMethod);

    expect(authId).toEqual('0xef71c2604f17ec6fc13409df24efdc440d240d37');

  });

  it('should parse one of element in the session sigs as an auth method', () => {

    const sessionSigs = {
      'https://cayenne.litgateway.com:7371': {
        sig: 'bc979e5bdbf587d33ffa8307a860691611cf3860facff4a512cae3056dcae26e3a305024a4c49cda76f848dcbf63d859440e83b06828f476e611d693ac330006',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xfc30091baaa18ffbf41ac0554243f167c04b0d0c01b93d600bac89ebde86446b5e890ad918b466a6bf9af75c16f3481efc9a19414287ee191db628564c348cab1c","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0x527be55d79490fFD86DfC8335661A4c34cD5d280\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\\n\\nURI: lit:session:5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279\\nVersion: 1\\nChain ID: 1\\nNonce: 0x29bcc5afff04c1c2b58b5f4db56df3e67b92ba36f78c7e2eb973b7e2b3ab780b\\nIssued At: 2024-01-20T09:52:59Z\\nExpiration Time: 2024-01-20T09:53:45.496Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0x527be55d79490fFD86DfC8335661A4c34cD5d280"}],"issuedAt":"2024-01-20T09:53:10.859Z","expiration":"2024-01-20T09:58:10.859Z","nodeAddress":"https://cayenne.litgateway.com:7371"}`,
        address: '5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279',
        algo: 'ed25519'
      },
      'https://cayenne.litgateway.com:7372': {
        sig: '51358584b90db4bb917a15a8f339c06d3ce2600d34a916d3db832aef70079dc4a878b775ca3a11f79796e5b377a158a9b8aadb4ad5e24e552e4bf2a9d8c97006',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xfc30091baaa18ffbf41ac0554243f167c04b0d0c01b93d600bac89ebde86446b5e890ad918b466a6bf9af75c16f3481efc9a19414287ee191db628564c348cab1c","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0x527be55d79490fFD86DfC8335661A4c34cD5d280\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\\n\\nURI: lit:session:5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279\\nVersion: 1\\nChain ID: 1\\nNonce: 0x29bcc5afff04c1c2b58b5f4db56df3e67b92ba36f78c7e2eb973b7e2b3ab780b\\nIssued At: 2024-01-20T09:52:59Z\\nExpiration Time: 2024-01-20T09:53:45.496Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0x527be55d79490fFD86DfC8335661A4c34cD5d280"}],"issuedAt":"2024-01-20T09:53:10.859Z","expiration":"2024-01-20T09:58:10.859Z","nodeAddress":"https://cayenne.litgateway.com:7372"}`,
        address: '5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279',
        algo: 'ed25519'
      },
      'https://cayenne.litgateway.com:7370': {
        sig: 'a59df369e3e959c2ffd05f12e0de0bc64dcbf70612594b369e43e07eb4792c51822508e6d00f78244f8225fb89f89f9544adf46e05721a586d28e7ddea4bdf04',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xfc30091baaa18ffbf41ac0554243f167c04b0d0c01b93d600bac89ebde86446b5e890ad918b466a6bf9af75c16f3481efc9a19414287ee191db628564c348cab1c","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0x527be55d79490fFD86DfC8335661A4c34cD5d280\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\\n\\nURI: lit:session:5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279\\nVersion: 1\\nChain ID: 1\\nNonce: 0x29bcc5afff04c1c2b58b5f4db56df3e67b92ba36f78c7e2eb973b7e2b3ab780b\\nIssued At: 2024-01-20T09:52:59Z\\nExpiration Time: 2024-01-20T09:53:45.496Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0x527be55d79490fFD86DfC8335661A4c34cD5d280"}],"issuedAt":"2024-01-20T09:53:10.859Z","expiration":"2024-01-20T09:58:10.859Z","nodeAddress":"https://cayenne.litgateway.com:7370"}`,
        address: '5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279',
        algo: 'ed25519'
      }
    };

    const authMethod = {
      "authMethodType": 1,
      "accessToken": JSON.stringify(sessionSigs),
    };

    const authId = getEthAuthMethodId(authMethod);

    expect(authId).toEqual('5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279');
  });

  it('check if the given object is a session sigs object', () => {
    const sessionSigs = {
      'https://cayenne.litgateway.com:7371': {
        sig: 'bc979e5bdbf587d33ffa8307a860691611cf3860facff4a512cae3056dcae26e3a305024a4c49cda76f848dcbf63d859440e83b06828f476e611d693ac330006',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xfc30091baaa18ffbf41ac0554243f167c04b0d0c01b93d600bac89ebde86446b5e890ad918b466a6bf9af75c16f3481efc9a19414287ee191db628564c348cab1c","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0x527be55d79490fFD86DfC8335661A4c34cD5d280\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\\n\\nURI: lit:session:5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279\\nVersion: 1\\nChain ID: 1\\nNonce: 0x29bcc5afff04c1c2b58b5f4db56df3e67b92ba36f78c7e2eb973b7e2b3ab780b\\nIssued At: 2024-01-20T09:52:59Z\\nExpiration Time: 2024-01-20T09:53:45.496Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0x527be55d79490fFD86DfC8335661A4c34cD5d280"}],"issuedAt":"2024-01-20T09:53:10.859Z","expiration":"2024-01-20T09:58:10.859Z","nodeAddress":"https://cayenne.litgateway.com:7371"}`,
        address: '5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279',
        algo: 'ed25519'
      },
      'https://cayenne.litgateway.com:7372': {
        sig: '51358584b90db4bb917a15a8f339c06d3ce2600d34a916d3db832aef70079dc4a878b775ca3a11f79796e5b377a158a9b8aadb4ad5e24e552e4bf2a9d8c97006',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xfc30091baaa18ffbf41ac0554243f167c04b0d0c01b93d600bac89ebde86446b5e890ad918b466a6bf9af75c16f3481efc9a19414287ee191db628564c348cab1c","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0x527be55d79490fFD86DfC8335661A4c34cD5d280\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\\n\\nURI: lit:session:5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279\\nVersion: 1\\nChain ID: 1\\nNonce: 0x29bcc5afff04c1c2b58b5f4db56df3e67b92ba36f78c7e2eb973b7e2b3ab780b\\nIssued At: 2024-01-20T09:52:59Z\\nExpiration Time: 2024-01-20T09:53:45.496Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0x527be55d79490fFD86DfC8335661A4c34cD5d280"}],"issuedAt":"2024-01-20T09:53:10.859Z","expiration":"2024-01-20T09:58:10.859Z","nodeAddress":"https://cayenne.litgateway.com:7372"}`,
        address: '5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279',
        algo: 'ed25519'
      },
      'https://cayenne.litgateway.com:7370': {
        sig: 'a59df369e3e959c2ffd05f12e0de0bc64dcbf70612594b369e43e07eb4792c51822508e6d00f78244f8225fb89f89f9544adf46e05721a586d28e7ddea4bdf04',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xfc30091baaa18ffbf41ac0554243f167c04b0d0c01b93d600bac89ebde86446b5e890ad918b466a6bf9af75c16f3481efc9a19414287ee191db628564c348cab1c","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0x527be55d79490fFD86DfC8335661A4c34cD5d280\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\\n\\nURI: lit:session:5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279\\nVersion: 1\\nChain ID: 1\\nNonce: 0x29bcc5afff04c1c2b58b5f4db56df3e67b92ba36f78c7e2eb973b7e2b3ab780b\\nIssued At: 2024-01-20T09:52:59Z\\nExpiration Time: 2024-01-20T09:53:45.496Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0x527be55d79490fFD86DfC8335661A4c34cD5d280"}],"issuedAt":"2024-01-20T09:53:10.859Z","expiration":"2024-01-20T09:58:10.859Z","nodeAddress":"https://cayenne.litgateway.com:7370"}`,
        address: '5772888f4db93459de6bf115c121f77acf598af24c261de1660c9d3ecaabc279',
        algo: 'ed25519'
      }
    };

    expect(isSessionSigs(sessionSigs)).toEqual(true);

  });
});