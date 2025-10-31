import { litActionCodeRepository, setLitActionsCode } from './code-repository';

describe('wrapped keys lit action code repository', () => {
  describe('litActionCodeRepository', () => {
    it('should be defined', () => {
      expect(litActionCodeRepository).toBeDefined();
    });

    it('should have empty values on init', () => {
      expect(litActionCodeRepository).toEqual({
        signTransaction: {
          evm: '',
          solana: '',
        },
        signMessage: {
          evm: '',
          solana: '',
        },
        signTypedData: {
          evm: '',
          solana: '',
        },
        generateEncryptedKey: {
          evm: '',
          solana: '',
        },
        exportPrivateKey: {
          evm: '',
          solana: '',
        },
      });
      expect(litActionCodeRepository.signTransaction).toEqual({
        evm: '',
        solana: '',
      });

      litActionCodeRepository.signTransaction.evm = 'test';
      expect(litActionCodeRepository.signTransaction.evm).toEqual('test');
    });
  });

  describe('setLitActionsCode', () => {
    it('should throw an error for invalid action type', () => {
      expect(() =>
        setLitActionsCode({
          // @ts-expect-error invalid action type
          invalidActionType: {
            evm: 'test',
            solana: 'test',
          },
        })
      ).toThrowError(
        `Invalid key: invalidActionType; must be one of signTransaction,signMessage,generateEncryptedKey,exportPrivateKey`
      );
    });

    it('should throw an error for invalid network', () => {
      expect(() =>
        setLitActionsCode({
          signTransaction: {
            // @ts-expect-error invalid network
            invalidNetwork: 'test',
            solana: 'test',
          },
        })
      ).toThrowError(
        `Invalid LitActionRepository entry: {"invalidNetwork":"test","solana":"test"}`
      );
    });

    it('should throw an error for invalid entry', () => {
      expect(() =>
        setLitActionsCode({
          signTransaction: {
            // @ts-expect-error invalid entry
            evm: 123,
            solana: 'test',
          },
        })
      ).toThrowError(
        `Invalid LitActionRepository entry: {"evm":123,"solana":"test"}`
      );
    });

    it('should set the litActionCodeRepository with the provided entries', () => {
      setLitActionsCode({
        signTransaction: {
          evm: 'test',
          solana: 'test',
        },
        signMessage: {
          evm: 'test',
          solana: 'test',
        },
        signTypedData: {
          evm: 'test',
          solana: 'test',
        },
        generateEncryptedKey: {
          evm: 'test',
          solana: 'test',
        },
        exportPrivateKey: {
          evm: 'test',
          solana: 'test',
        },
      });
      expect(litActionCodeRepository).toEqual({
        signTransaction: {
          evm: 'test',
          solana: 'test',
        },
        signMessage: {
          evm: 'test',
          solana: 'test',
        },
        signTypedData: {
          evm: 'test',
          solana: 'test',
        },
        generateEncryptedKey: {
          evm: 'test',
          solana: 'test',
        },
        exportPrivateKey: {
          evm: 'test',
          solana: 'test',
        },
      });
    });

    it('should allow complete and partial updates', () => {
      setLitActionsCode({
        signTransaction: {
          evm: 'test',
          solana: 'test',
        },
        signMessage: {
          evm: 'test',
          solana: 'test',
        },
        signTypedData: {
          evm: 'test',
          solana: 'test',
        },
        generateEncryptedKey: {
          evm: 'test',
          solana: 'test',
        },
        exportPrivateKey: {
          evm: 'test',
          solana: 'test',
        },
      });
      setLitActionsCode({
        signTransaction: {
          evm: 'eth',
        },
        signMessage: {
          evm: 'eth',
        },
      });

      expect(litActionCodeRepository).toEqual({
        signTransaction: {
          evm: 'eth',
          solana: 'test',
        },
        signMessage: {
          evm: 'eth',
          solana: 'test',
        },
        signTypedData: {
          evm: 'eth',
          solana: 'test',
        },
        generateEncryptedKey: {
          evm: 'test',
          solana: 'test',
        },
        exportPrivateKey: {
          evm: 'test',
          solana: 'test',
        },
      });
      expect(litActionCodeRepository.signTransaction).toEqual({
        evm: 'eth',
        solana: 'test',
      });
    });
  });
});
