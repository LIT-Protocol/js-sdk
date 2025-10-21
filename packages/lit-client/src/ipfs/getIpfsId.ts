import * as Hash from 'typestub-ipfs-only-hash';

export type IpfsCidV0 = `Qm${string}`;

type SupportedInput = string | Uint8Array | ArrayBuffer | ArrayBufferView;

// Ensure string inputs are encoded without relying on Node's global Buffer, falling back to util.TextEncoder when needed.
const encodeString = (value: string): Uint8Array => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TextEncoder: NodeTextEncoder } = require('util');
    return new NodeTextEncoder().encode(value);
  } catch (error) {
    throw new Error('TextEncoder is not available in this environment');
  }
};

const toUint8Array = (value: ArrayBuffer | ArrayBufferView): Uint8Array => {
  // TypedArray/DataView instances expose a shared buffer; slice the relevant window into a standalone Uint8Array.
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  return new Uint8Array(value);
};

const normalizeInput = (input: SupportedInput): Uint8Array => {
  // Accommodate all portable input shapes while keeping the helper tree-shakeable and browser-friendly.
  if (typeof input === 'string') {
    return encodeString(input);
  }

  if (input instanceof Uint8Array) {
    return toUint8Array(input);
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (input instanceof ArrayBuffer) {
      return toUint8Array(input);
    }

    if (ArrayBuffer.isView(input)) {
      return toUint8Array(input);
    }
  }

  throw new TypeError(
    'Input must be provided as a string, Uint8Array, ArrayBuffer or ArrayBufferView'
  );
};

/**
 * Generate a CIDv0 IPFS identifier for the provided content.
 */
export const getIpfsId = async (input: SupportedInput): Promise<IpfsCidV0> => {
  const normalizedInput = normalizeInput(input);
  const hashOf = Hash.of as unknown as (
    value: string | Uint8Array
  ) => Promise<string>;
  const cid = await hashOf(normalizedInput);

  if (!cid.startsWith('Qm')) {
    throw new Error('Generated IPFS CID is not CIDv0');
  }

  return cid as IpfsCidV0;
};
