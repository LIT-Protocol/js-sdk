import { localStorage } from './lib/storage/localStorage';
import type { LitAuthStorageProvider } from './lib/storage/types';
import type { LitAuthData } from './lib/types';

export type { LitAuthStorageProvider };
export type { LitAuthData };

export const storagePlugins = {
  localStorage,
};

export { localStorage };
