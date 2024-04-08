import {
  getSessionSigReport,
  humanizedSiweSignedMessage,
} from './humanized-siwe-signed-message';

describe('humanizedSignedMessage', () => {
  it('should return a humanized signed message', () => {
    const signedMessage =
      '{"sessionKey":"16a23380b8987f263f9fff73e89da7a801819faf669fe72eaf3d9a6c70ffaa97","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0xa7c51e3181c1896037b14a423fb44fd684f08a80a57f9ee0b6027ad23dda385d151595ee5ebd16cfef7cfa549808dc5af6792c6ffdd7bfff5f9ae1061abe757c1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\\n\\nThis is a test statement.  You can put anything you want here.\\n\\nURI: lit:session:16a23380b8987f263f9fff73e89da7a801819faf669fe72eaf3d9a6c70ffaa97\\nVersion: 1\\nChain ID: 1\\nNonce: 0x666d3bddc695d59d511306c5bd440d2384a88251848b931d2c3bb6c83be47c6d\\nIssued At: 2024-04-06T11:25:57.154Z\\nExpiration Time: 2024-04-07T11:25:57.144Z\\nResources:\\n- urn:recap:eyJhdHQiOnt9LCJwcmYiOltdfQ","address":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}],"issuedAt":"2024-04-06T11:25:57.156Z","expiration":"2024-04-06T11:30:57.156Z","nodeAddress":"http://127.0.0.1:7471"}';

    const report = humanizedSiweSignedMessage(signedMessage);
    console.log('report:', report);

    expect(report).toContain(
      'Session Key: 16a23380b8987f263f9fff73e89da7a801819faf669fe72eaf3d9a6c70ffaa97'
    );
  });
});
