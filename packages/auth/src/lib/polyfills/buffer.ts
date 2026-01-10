import { Buffer } from 'buffer/index.js';

const globalWithBuffer = globalThis as unknown as {
  Buffer?: typeof Buffer;
};

if (!globalWithBuffer.Buffer) {
  globalWithBuffer.Buffer = Buffer;
}
