import { LitNodejsStorage } from './lit-nodejs-storage';
import { ILitStorage } from './types';

export class LitStorage implements ILitStorage {
  keys = {
    autoAuth: 'lit-auto-auth',
  };

  private storage: ILitStorage;

  constructor(storageProvider?: ILitStorage) {
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

  // -- extra functions
  setExpirableItem(
    key: string,
    value: string,
    duration: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days'
  ): void {
    const expirationDate = new Date();

    switch (unit) {
      case 'seconds':
        expirationDate.setSeconds(expirationDate.getSeconds() + duration);
        break;
      case 'minutes':
        expirationDate.setMinutes(expirationDate.getMinutes() + duration);
        break;
      case 'hours':
        expirationDate.setHours(expirationDate.getHours() + duration);
        break;
      case 'days':
        expirationDate.setDate(expirationDate.getDate() + duration);
        break;
      default:
        throw new Error(`Invalid unit of time: ${unit}`);
    }

    const item = {
      value: value,
      expirationDate: expirationDate.toJSON(),
    };
    return this.storage.setItem(key, JSON.stringify(item));
  }

  getExpirableItem(key: string): string | null {
    const itemStr = this.storage.getItem(key);

    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (item && item.expirationDate) {
      const expirationDate = new Date(item.expirationDate);
      if (new Date() > expirationDate) {
        // The item is expired, remove it from the storage
        this.storage.removeItem(key);
        return null;
      }
      return item.value;
    }
    return null;
  }

  isItemExpired(key: string): boolean {
    const itemStr = this.storage.getItem(key);

    if (!itemStr) return true;

    const item = JSON.parse(itemStr);
    if (item && item.expirationDate) {
      const expirationDate = new Date(item.expirationDate);
      return new Date() > expirationDate;
    }
    return false;
  }

  // -- convert expirable to ISO string
  convertToISOString(
    expirationLength: number,
    expirationUnit: 'seconds' | 'minutes' | 'hours' | 'days'
  ) {
    let multiplier;

    switch (expirationUnit) {
      case 'seconds':
        multiplier = 1000;
        break;
      case 'minutes':
        multiplier = 1000 * 60;
        break;
      case 'hours':
        multiplier = 1000 * 60 * 60;
        break;
      case 'days':
        multiplier = 1000 * 60 * 60 * 24;
        break;
      default:
        throw new Error(`Invalid unit of time: ${expirationUnit}`);
    }

    return new Date(Date.now() + multiplier * expirationLength).toISOString();
  }
}
