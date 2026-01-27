import { localStorageNode } from './lib/storage/localStorageNode';
import type { LitAuthStorageProvider } from './lib/storage/types';
import type { LitAuthData } from './lib/types';

export type { LitAuthStorageProvider };
export type { LitAuthData };

export const storagePlugins = {
  localStorageNode,
};

export { localStorageNode };
