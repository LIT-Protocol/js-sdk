import { Buffer } from 'buffer/index.js';

const globalWithBuffer = globalThis as unknown as {
  Buffer?: unknown;
};

if (!globalWithBuffer.Buffer) {
  globalWithBuffer.Buffer = Buffer;
}
