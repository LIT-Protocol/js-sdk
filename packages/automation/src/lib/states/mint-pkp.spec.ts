import { LitContracts } from '@lit-protocol/contracts-sdk';

import { MintPKPState, MintPKPStateParams } from './mint-pkp';

describe('MintPKPState', () => {
  let mockLitContracts: LitContracts;
  let mockCallback: jest.Mock;
  let mockMint: jest.Mock;

  beforeEach(() => {
    mockMint = jest.fn().mockResolvedValue({
      pkp: {
        tokenId: '123',
        publicKey: '0xPublicKey',
        ethAddress: '0xEthAddress',
      },
    });

    mockLitContracts = {
      pkpNftContractUtils: {
        write: {
          mint: mockMint,
        },
      },
    } as unknown as LitContracts;

    mockCallback = jest.fn();
  });

  it('should mint a PKP and call the callback with PKP info', async () => {
    const params: MintPKPStateParams = {
      key: 'MintPKPState',
      litContracts: mockLitContracts,
      callback: mockCallback,
    };

    const state = new MintPKPState(params);

    await state.enter();

    expect(mockMint).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith({
      tokenId: '123',
      publicKey: '0xPublicKey',
      ethAddress: '0xEthAddress',
    });
  });

  it('should handle errors during minting', async () => {
    mockMint.mockRejectedValue(new Error('Minting error'));

    const params: MintPKPStateParams = {
      key: 'MintPKPState',
      litContracts: mockLitContracts,
      callback: mockCallback,
    };

    const state = new MintPKPState(params);

    await expect(state.enter()).rejects.toThrow('Minting error');
  });

  it('should execute onEnter callback if provided', async () => {
    const onEnter = jest.fn();
    const params: MintPKPStateParams = {
      key: 'MintPKPState',
      litContracts: mockLitContracts,
      callback: mockCallback,
      onEnter,
    };

    const state = new MintPKPState(params);

    await state.enter();

    expect(onEnter).toHaveBeenCalled();
  });
});
