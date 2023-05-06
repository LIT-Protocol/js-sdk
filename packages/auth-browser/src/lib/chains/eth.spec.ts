import { isSignedMessageExpired } from './eth';

describe('isSignedMessageExpired', () => {
  it('1 should return true if the signed message is expired', () => {
    const signedMessage = `localhost:4003 wants you to sign in with your Ethereum account:\n0x123123123123\n\n\nURI: http://localhost:4003/\nVersion: 1\nChain ID: 1\nNonce: xxx\nIssued At: 2023-04-28T13:30:44.477Z\nExpiration Time: 2023-05-04T00:00:44.452Z`;

    expect(isSignedMessageExpired(signedMessage)).toBe(true);
  });

  it('2 should return true if the signed message is expired', () => {
    const signedMessage = `localhost:4003 wants you to sign in with your Ethereum account:\n0x123123123123\n\n\nURI: http://localhost:4003/\nVersion: 1\nChain ID: 1\nNonce: xxx\nIssued At: 2023-04-28T13:30:44.477Z\nExpiration Time: 2022-05-04T00:00:44.452Z`;

    expect(isSignedMessageExpired(signedMessage)).toBe(true);
  });

  it('should return false if the signed message is not expired', () => {
    const signedMessage = `XX:3000 wants you to sign in with your Ethereum account:\nXXX\n\n\nURI: http://XX:3000/\nVersion: 1\nChain ID: 1\nNonce: xxx\nIssued At: 2025-05-04T11:37:21.870Z\nExpiration Time: 2099-05-11T11:37:18.344Z`;

    expect(isSignedMessageExpired(signedMessage)).toBe(false);
  });

  it('should return false if the signed message has no Expiration Time', () => {
    const signedMessage = `XX:3000 wants you to sign in with your Ethereum account:\nXXX\n\n\nURI: http://XX:3000/\nVersion: 1\nChain ID: 1\nNonce: xxx\nIssued At: 2099-05-04T11:37:21.870Z`;

    expect(isSignedMessageExpired(signedMessage)).toBe(false);
  });
});
