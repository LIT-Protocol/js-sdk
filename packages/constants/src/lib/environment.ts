export class Environment {
  static get isNode(): boolean {
    return typeof process?.versions?.node !== 'undefined';
  }

  static get isBrowser(): boolean {
    return !Environment.isNode;
  }
}
