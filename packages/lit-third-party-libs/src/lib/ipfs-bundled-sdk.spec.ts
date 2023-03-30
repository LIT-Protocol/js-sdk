// ipfs-bundled-sdk.spec.ts

// Remove this line
import { IPFSBundledSDK } from './ipfs-bundled-sdk';

describe('IPFSBundledSDK', () => {
  it('should be defined', () => {
    expect(IPFSBundledSDK).toBeDefined();
  });

  it('should have "importer" function', () => {
    expect(IPFSBundledSDK.importer).toBeDefined();
  });

  it('should have "MemoryBlockstore" class', () => {
    expect(IPFSBundledSDK.MemoryBlockstore).toBeDefined();
  });
});
