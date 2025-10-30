jest.mock('@lit-protocol/crypto', () => ({
  walletEncrypt: jest.fn(),
  walletDecrypt: jest.fn(),
}));

jest.mock('@lit-protocol/logger', () => ({
  getChildLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

import { NodeError } from '@lit-protocol/constants';
import { NagaJitContext } from '@lit-protocol/types';
import { E2EERequestManager } from './E2EERequestManager';

describe('E2EERequestManager.handleEncryptedError', () => {
  it('includes the requestId in the thrown error message', () => {
    const requestId = 'test-request-123';
    const jitContext = { keySet: {} } as unknown as NagaJitContext;

    expect.assertions(3);

    try {
      E2EERequestManager.handleEncryptedError(
        { error: 'simulated node failure' },
        jitContext,
        'UnitTestOperation',
        requestId
      );
    } catch (error) {
      expect(error).toBeInstanceOf(NodeError);
      const message = (error as Error).message;
      expect(message).toContain(requestId);
      expect(message).toContain('UnitTestOperation');
    }
  });
});
