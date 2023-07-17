import { IStorage } from '../types';
import { LitNodejsStorage } from './lit-nodejs-storage';

export class LitStorage implements IStorage {
  items = {
    authAuth: 'lit-auto-auth',
  };

  private storage: IStorage;

  constructor(storageProvider?: IStorage) {
    // If user provided their own storage provider, use it
    // Otherwise, check if we're in browser or Node.js and choose appropriate provider
    if (storageProvider) {
      this.storage = storageProvider;
    } else if (typeof window !== 'undefined') {
      this.storage = window.localStorage;
    } else {
      this.storage = new LitNodejsStorage();
    }
  }

  get length(): number {
    return this.storage.length;
  }

  clear(): void {
    return this.storage.clear();
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  key(index: number): string | null {
    return this.storage.key(index);
  }

  removeItem(key: string): void {
    return this.storage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    return this.storage.setItem(key, value);
  }
}
