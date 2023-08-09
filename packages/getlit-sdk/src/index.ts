import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';

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

export { loadLit };
