import { registerWrappedKeysTests } from '../test-helpers/executeJs/wrappedKeys';

export function registerWrappedKeysSuite() {
  describe('wrapped keys', () => {
    registerWrappedKeysTests();
  });
}

