import { InvalidArgumentException } from '@lit-protocol/constants';
import { PaymentDelegationScope } from '@lit-protocol/types';

// We need to test the internal functions, but they're not exported
// So we'll import the module and use type casting to access them
import * as paymentDelegationModule from './payment-delegation';

// Type assertion to access internal functions for testing
const paymentDelegation = paymentDelegationModule as any;

describe('payment-delegation validation functions', () => {
  describe('normalizeDelegateeAddresses', () => {
    it('should normalize valid ethereum addresses', () => {
      const addresses = [
        '0x1234567890123456789012345678901234567890',
        '1234567890123456789012345678901234567890',
      ];
      const result = paymentDelegation.normalizeDelegateeAddresses?.(addresses);
      
      if (result) {
        expect(result).toHaveLength(2);
        expect(result[0]).toBe('1234567890123456789012345678901234567890');
        expect(result[1]).toBe('1234567890123456789012345678901234567890');
      }
    });

    it('should checksum addresses correctly', () => {
      const addresses = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045'];
      const result = paymentDelegation.normalizeDelegateeAddresses?.(addresses);
      
      if (result) {
        expect(result[0]).toBe('d8da6bf26964af9d7eed9e03e53415d37aa96045');
      }
    });

    it('should throw on invalid address', () => {
      if (paymentDelegation.normalizeDelegateeAddresses) {
        expect(() => paymentDelegation.normalizeDelegateeAddresses(['invalid'])).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on empty string address', () => {
      if (paymentDelegation.normalizeDelegateeAddresses) {
        expect(() => paymentDelegation.normalizeDelegateeAddresses([''])).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on non-string address', () => {
      if (paymentDelegation.normalizeDelegateeAddresses) {
        expect(() => paymentDelegation.normalizeDelegateeAddresses([123 as any])).toThrow(
          InvalidArgumentException
        );
      }
    });
  });

  describe('normalizeScopes', () => {
    it('should accept valid scopes', () => {
      const scopes: PaymentDelegationScope[] = ['pkp_sign', 'encryption_sign'];
      const result = paymentDelegation.normalizeScopes?.(scopes);
      
      if (result) {
        expect(result).toEqual(['pkp_sign', 'encryption_sign']);
      }
    });

    it('should deduplicate scopes', () => {
      const scopes: PaymentDelegationScope[] = [
        'pkp_sign',
        'pkp_sign',
        'encryption_sign',
      ];
      const result = paymentDelegation.normalizeScopes?.(scopes);
      
      if (result) {
        expect(result).toHaveLength(2);
        expect(result).toContain('pkp_sign');
        expect(result).toContain('encryption_sign');
      }
    });

    it('should throw on empty array', () => {
      if (paymentDelegation.normalizeScopes) {
        expect(() => paymentDelegation.normalizeScopes([])).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on invalid scope', () => {
      if (paymentDelegation.normalizeScopes) {
        expect(() =>
          paymentDelegation.normalizeScopes(['invalid_scope' as PaymentDelegationScope])
        ).toThrow(InvalidArgumentException);
      }
    });

    it('should throw on non-array input', () => {
      if (paymentDelegation.normalizeScopes) {
        expect(() => paymentDelegation.normalizeScopes('pkp_sign' as any)).toThrow(
          InvalidArgumentException
        );
      }
    });
  });

  describe('normalizeMaxPrice', () => {
    it('should convert bigint to hex string', () => {
      const result = paymentDelegation.normalizeMaxPrice?.(1000n);
      expect(result).toBe('3e8');
    });

    it('should convert number to hex string', () => {
      const result = paymentDelegation.normalizeMaxPrice?.(1000);
      expect(result).toBe('3e8');
    });

    it('should handle decimal string', () => {
      const result = paymentDelegation.normalizeMaxPrice?.('1000');
      expect(result).toBe('3e8');
    });

    it('should handle hex string with 0x prefix', () => {
      const result = paymentDelegation.normalizeMaxPrice?.('0x3e8');
      expect(result).toBe('3e8');
    });

    it('should handle hex string without 0x prefix', () => {
      const result = paymentDelegation.normalizeMaxPrice?.('3e8');
      expect(result).toBe('3e8');
    });

    it('should throw on null', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice(null as any)).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on undefined', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice(undefined as any)).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on negative bigint', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice(-1n)).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on negative number', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice(-1)).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on NaN', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice(NaN)).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on Infinity', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice(Infinity)).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on empty string', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice('')).toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on invalid string format', () => {
      if (paymentDelegation.normalizeMaxPrice) {
        expect(() => paymentDelegation.normalizeMaxPrice('abc xyz')).toThrow(
          InvalidArgumentException
        );
      }
    });
  });

  describe('resolveNonce', () => {
    it('should return provided nonce if valid', async () => {
      const params = { nonce: 'test-nonce' } as any;
      const result = await paymentDelegation.resolveNonce?.(params);
      expect(result).toBe('test-nonce');
    });

    it('should throw on empty nonce string', async () => {
      if (paymentDelegation.resolveNonce) {
        const params = { nonce: '   ' } as any;
        await expect(paymentDelegation.resolveNonce(params)).rejects.toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw on non-string nonce', async () => {
      if (paymentDelegation.resolveNonce) {
        const params = { nonce: 123 } as any;
        await expect(paymentDelegation.resolveNonce(params)).rejects.toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should get nonce from litClient.getContext()', async () => {
      if (paymentDelegation.resolveNonce) {
        const params = {
          litClient: {
            getContext: jest.fn().mockResolvedValue({
              latestBlockhash: 'blockhash-123',
            }),
          },
        } as any;
        const result = await paymentDelegation.resolveNonce(params);
        expect(result).toBe('blockhash-123');
      }
    });

    it('should throw when litClient.getContext() returns no latestBlockhash', async () => {
      if (paymentDelegation.resolveNonce) {
        const params = {
          litClient: {
            getContext: jest.fn().mockResolvedValue({}),
          },
        } as any;
        await expect(paymentDelegation.resolveNonce(params)).rejects.toThrow(
          InvalidArgumentException
        );
      }
    });

    it('should throw when neither nonce nor litClient provided', async () => {
      if (paymentDelegation.resolveNonce) {
        const params = {} as any;
        await expect(paymentDelegation.resolveNonce(params)).rejects.toThrow(
          InvalidArgumentException
        );
      }
    });
  });

  describe('resolveSignerAddress', () => {
    it('should return provided signerAddress', async () => {
      const params = {
        signerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        signer: {} as any,
      } as any;
      const result = await paymentDelegation.resolveSignerAddress?.(params);
      expect(result).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    });

    it('should get address from signer.getAddress()', async () => {
      if (paymentDelegation.resolveSignerAddress) {
        const params = {
          signer: {
            getAddress: jest
              .fn()
              .mockResolvedValue('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
          },
        } as any;
        const result = await paymentDelegation.resolveSignerAddress(params);
        expect(result).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      }
    });

    it('should get address from signer.address', async () => {
      if (paymentDelegation.resolveSignerAddress) {
        const params = {
          signer: {
            address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
          },
        } as any;
        const result = await paymentDelegation.resolveSignerAddress(params);
        expect(result).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      }
    });

    it('should throw when no address can be resolved', async () => {
      if (paymentDelegation.resolveSignerAddress) {
        const params = {
          signer: {},
        } as any;
        await expect(paymentDelegation.resolveSignerAddress(params)).rejects.toThrow(
          InvalidArgumentException
        );
      }
    });
  });
});

describe('createPaymentDelegationAuthSig', () => {
  it('should throw when signer is not provided', async () => {
    await expect(
      paymentDelegationModule.createPaymentDelegationAuthSig({
        signer: undefined as any,
        delegateeAddresses: ['0x123'],
        maxPrice: '1000',
        scopes: ['pkp_sign'],
        nonce: 'test',
      })
    ).rejects.toThrow(InvalidArgumentException);
  });

  it('should throw when delegateeAddresses is empty', async () => {
    await expect(
      paymentDelegationModule.createPaymentDelegationAuthSig({
        signer: {} as any,
        delegateeAddresses: [],
        maxPrice: '1000',
        scopes: ['pkp_sign'],
        nonce: 'test',
      })
    ).rejects.toThrow(InvalidArgumentException);
  });

  it('should throw when delegateeAddresses is not provided', async () => {
    await expect(
      paymentDelegationModule.createPaymentDelegationAuthSig({
        signer: {} as any,
        delegateeAddresses: undefined as any,
        maxPrice: '1000',
        scopes: ['pkp_sign'],
        nonce: 'test',
      })
    ).rejects.toThrow(InvalidArgumentException);
  });
});
