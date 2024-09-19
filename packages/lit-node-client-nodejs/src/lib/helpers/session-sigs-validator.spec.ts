import { Capability, ParsedSessionMessage } from '@lit-protocol/types';
import {
  parseSignedMessage,
  validateExpiration,
  parseCapabilities,
  validateSessionSignature,
  ValidationResult,
} from './session-sigs-validator';

describe('sessionSigsValidator', () => {
  const MOCK_SESSION_SIGS_1 = {
    'https://51.255.59.58:443': {
      sig: 'd825bff870940a8f9027eb4f99c037dcc31d80e7c7606552f09762ef49aebb2116b97f0e049e80d7e27ab17a160133e6be36791e18add5325cae4df8d62cf80d',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://51.255.59.58:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
    'https://147.135.61.242:443': {
      sig: '5e851c5c8b741705fdf67c441a12d87249a53b0bb82c6986878e9a809fdf3c97b5fa4d7725b170eaa245aa59c268a6b2bcb3706b877a4d66b1759c7aeeec7705',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://147.135.61.242:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
    'https://199.115.117.115:443': {
      sig: 'c5d274861ef6a57718fe19c9926c0f29798dab9afc71ab956bdef701a1b8ef7aa4718863aa03b1e327fe54832aeaffbc74753d905114236f05f0b76be0c2dc0e',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://199.115.117.115:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
    'https://167.114.17.202:443': {
      sig: '9f737e6f2be2c44eed24e54f7e17deb9dbd599f9e8b9c2013e968f21c5383c03f9b89d9ccd92dbc83e19bb14a219a86482af7db8fa3155775a112f6d7b18f600',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://167.114.17.202:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
    'https://158.69.108.66:443': {
      sig: '23edf6742d3a059335bf84d1ff446203e983da44ee7611eccf35f5e4c6a6a166c9ad69562ea55137d5c26a197263a66d3eea55630393f5a4302c1cb8adacf805',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://158.69.108.66:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
    'https://167.114.17.201:443': {
      sig: '58a4d7af8effcd4d17986bae0af2e444e8ff7eaea33954beaaf8bb19c0d6143f0f091e1971d5bf928a70a795bca355efe4015ea621eee2b9315ff04e3c2d730c',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://167.114.17.201:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
    'https://158.69.163.138:443': {
      sig: '5009072888f54911aa1e68c8b4916fd8a0df34089d3ebcec78f4a7258aac427df5a1b6b5a96375fc92e872c48de632f648280bcaccd46f8a05f018e60ee03502',
      derivedVia: 'litSessionSignViaNacl',
      signedMessage: `{"sessionKey":"b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x6e1193c850db9ef9a4cc4a91b3eb881779b69277f878806efa1de27eec4a30d2718e68c9e6d40658cc86b89df7965aaae80f954b20518504b38433854c13616e1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.\\n\\nURI: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:33.606Z\\nExpiration Time: 2024-09-26T13:07:33.602Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ","address":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"},{"sig":"{\\"ProofOfPossession\\":\\"a9188ea15b6d26b40149f1192a1d8723aa75f6a6022754109b1c6b17994cd41fb5443413430c4c9640a643598ac31e4f08eb1bca1c6ecca13378dd2d77d32fd22c88e8644c40da6342cf6c1e05edc0020eaeff3f1877d30add1b616f9f89b78e\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xB2AD7B55302a9C5a0600C6A58208d77866954909\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc\\nVersion: 1\\nChain ID: 1\\nNonce: 0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70\\nIssued At: 2024-09-19T13:07:23Z\\nExpiration Time: 2024-09-20T13:07:36.799Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4OTBGNzliZjZFQjJjNGY4NzAzNjVFNzg1OTgyRTFmMTAxRTkzYjkwNiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6InRydWUiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119","address":"0xB2AD7B55302a9C5a0600C6A58208d77866954909"}],"issuedAt":"2024-09-19T13:07:38.165Z","expiration":"2024-09-20T13:07:36.799Z","nodeAddress":"https://158.69.163.138:443"}`,
      address:
        'b97fe163eb6098457c707e7b223f9d1172a723589f1b7ac1e731cd0ad50518bc',
      algo: 'ed25519',
    },
  };

  const firstKey = Object.keys(MOCK_SESSION_SIGS_1)[0];
  const firstSessionSig = (MOCK_SESSION_SIGS_1 as { [key: string]: any })[
    firstKey
  ];

  it('should parse signedMessage correctly', () => {
    const signedMessage = firstSessionSig.signedMessage;
    let parsedSignedMessage: ParsedSessionMessage;

    try {
      parsedSignedMessage = JSON.parse(signedMessage);
    } catch (error) {
      fail('JSON.parse threw an exception: ' + (error as Error).message);
    }

    // Perform your assertions
    expect(parsedSignedMessage).toHaveProperty('capabilities');
    expect(parsedSignedMessage.capabilities).toBeInstanceOf(Array);
  });

  it('should parse capabilities and their signedMessages', () => {
    const parsedSignedMessage: ParsedSessionMessage = JSON.parse(
      firstSessionSig.signedMessage
    );
    const capabilities: Capability[] = parsedSignedMessage.capabilities;

    const capabilitiesValidationResult = parseCapabilities(capabilities);

    expect(capabilitiesValidationResult.isValid).toBe(true);
    expect(capabilitiesValidationResult.errors.length).toBe(0);

    capabilities.forEach((capability) => {
      expect(capability).toHaveProperty('parsedSignedMessage');
      expect(capability.parsedSignedMessage).toHaveProperty('Issued At');
    });
  });

  it('should validate expiration dates of capabilities', () => {
    const parsedSignedMessage: ParsedSessionMessage = JSON.parse(
      firstSessionSig.signedMessage
    );
    const capabilities: Capability[] = parsedSignedMessage.capabilities;

    const capabilitiesValidationResult = parseCapabilities(capabilities);

    expect(capabilitiesValidationResult.isValid).toBe(true);
    expect(capabilitiesValidationResult.errors.length).toBe(0);
  });

  it('should validate the main session signature', () => {
    const validationResult = validateSessionSignature(firstSessionSig);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors.length).toBe(0);
  });

  it('should detect expired capabilities', () => {
    // Parse the main signedMessage to get capabilities
    const parsedSignedMessage: ParsedSessionMessage = JSON.parse(
      firstSessionSig.signedMessage
    );
    const capabilities: Capability[] = parsedSignedMessage.capabilities;

    // Ensure that capabilities array exists and has at least one element
    if (!capabilities || capabilities.length === 0) {
      fail('No capabilities found in parsedSignedMessage.');
      return;
    }

    // Modify the expiration time to a past date for testing
    const expiredCapability: Capability = {
      ...capabilities[0],
    };
    expiredCapability.parsedSignedMessage = {
      ...parseSignedMessage(expiredCapability.signedMessage),
      'Expiration Time': '1997-01-01T00:00:00Z',
    };

    const validationResult = validateExpiration(
      expiredCapability.parsedSignedMessage['Expiration Time'],
      'test capability'
    );

    expect(validationResult.isValid).toBe(false);
    const containsExpectedError = validationResult.errors.some((error) =>
      error.includes('Expired test capability')
    );
    expect(containsExpectedError).toBe(true);
  });

  it('should detect invalid expiration date format', () => {
    // Parse the main signedMessage to get capabilities
    const parsedSignedMessage: ParsedSessionMessage = JSON.parse(
      firstSessionSig.signedMessage
    );
    const capabilities: Capability[] = parsedSignedMessage.capabilities;

    // Ensure that capabilities array exists and has at least one element
    if (!capabilities || capabilities.length === 0) {
      fail('No capabilities found in parsedSignedMessage.');
      return;
    }

    // Modify the expiration time to an invalid date format for testing
    const invalidDateCapability: Capability = {
      ...capabilities[0],
    };
    invalidDateCapability.parsedSignedMessage = {
      ...parseSignedMessage(invalidDateCapability.signedMessage),
      'Expiration Time': 'invalid-date-format',
    };

    const validationResult = validateExpiration(
      invalidDateCapability.parsedSignedMessage['Expiration Time'],
      'test capability'
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining(
        'Invalid Expiration Time format in test capability'
      )
    );
  });
});
