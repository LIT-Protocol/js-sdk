import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { isBrowser, waitForLit } from './lib/utils';

/**
 * This is a trick to make the instance behave like a function where you can async/await, but still be an instance where you can chain methods like .withPersistentStorage() .withAuthOptions() etc.
 *
 * @example
 * import { loadLit } from '@getlit/sdk';
 * await loadLit({ debug: true }).withPersistentStorage({
 *  provider: 'pinata',
 *  options: {
 *    JWT: '',
 *  }
 * });
 *
 * @example waitForLit()
 * This function is useful when you import your library like this `import "getlit/sdk"` which will load the package automatically. It can be used to wait for the Lit instance to be ready. For example, you want to access to a variable that is yet to be defined, you can create a wrapper function like this:
 *
 * async function createAccount() {
 *   await waitForLit();
 *   const account = await Lit.createAccount();
 *   return account;
 * }
 */
const loadLit = async (
  {
    debug,
  }: {
    debug?: boolean;
  } = {
    debug: true,
  }
): Promise<LitOptionsBuilder> => {
  return new LitOptionsBuilder().invoke({ debug });
};

export { loadLit, waitForLit };
