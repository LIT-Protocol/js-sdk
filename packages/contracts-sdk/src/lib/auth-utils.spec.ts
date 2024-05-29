import { getAuthIdByAuthMethod } from './auth-utils';

describe('getAuthIdByAuthMethod', () => {
  it('should return the auth method id for the given auth method', async () => {
    const authMethod = {
      authMethodType: 1,
      accessToken: '{"address": "0x123abc"}',
    };

    const authMethodId = await getAuthIdByAuthMethod(authMethod);

    expect(authMethodId).toEqual(
      '0xfd2f905d807d37105365c450643b6e04c83cf73223d166fb6d63d9b9c974f1a8'
    );
  });

  it('should throw an error for unsupported auth method type', async () => {
    const authMethod = {
      authMethodType: 5,
      accessToken: '...',
    };

    await expect(getAuthIdByAuthMethod(authMethod)).rejects.toThrow(
      'Unsupported auth method type: 5'
    );
  });
});
