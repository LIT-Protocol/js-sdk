export function getGlobal(): typeof globalThis {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window as any;
  if (typeof global !== 'undefined') return global as any;
  if (typeof self !== 'undefined') return self as any;
  throw new Error('Unable to locate global object');
}
