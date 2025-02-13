import { getAuthManager } from './lib/auth-manager';
import * as authenticators from './lib/authenticators';
import { LitRelay } from './lib/authenticators';
import { localStorage } from './lib/storage';

import type { LitAuthStorageProvider } from './lib/storage/types';
import type { LitAuthData } from './lib/types';

export type { LitAuthStorageProvider, LitAuthData };

export const storagePlugins = { localStorage };

export { authenticators, getAuthManager, LitRelay };
