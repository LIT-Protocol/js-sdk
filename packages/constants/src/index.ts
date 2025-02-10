// ----------- Version -----------
export * from './lib/version';

// ----------- Constants -----------
export * from './lib/constants/constants';
export * from './lib/constants/mappers';
export * from './lib/constants/endpoints';
export * from './lib/constants/curves';

// ----------- Interfaces -----------
export * from './lib/interfaces/i-errors';

// ----------- Errors -----------
export * from './lib/errors';

// ----------- Utils -----------
export * from './lib/utils/utils';

// ----------- ABIs -----------
import * as ABI_ERC20 from './lib/abis/ERC20.json';

export { ABI_ERC20 };
