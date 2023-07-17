import { IStorage } from '../types';

export class LitNodejsStorage implements IStorage {
  private storage: Record<string, string>;

  constructor() {
    this.storage = {};
  }

  get length(): number {
    return Object.keys(this.storage).length;
  }

  clear(): void {
    this.storage = {};
  }

  getItem(key: string): string | null {
    const item = this.storage[key];
    return item || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.storage);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }
}
