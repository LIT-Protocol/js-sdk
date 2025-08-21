import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createPKPSignAPI,
  createDecryptAPI,
  createExecuteJsAPI,
} from './APIFactory';

// Mock the dependencies
jest.mock('../session-manager/issueSessionFromContext', () => ({
  issueSessionFromContext: jest.fn(),
}));

jest.mock('./e2ee-request-manager/E2EERequestManager', () => ({
  E2EERequestManager: {
    encryptRequestData: jest.fn(),
    decryptBatchResponse: jest.fn(),
    handleEncryptedError: jest.fn(),
  },
}));

jest.mock('../../endpoints-manager/composeLitUrl', () => ({
  composeLitUrl: jest.fn(),
}));

// Mock helper function
jest.mock('../../../shared/helpers/createRequestId', () => ({
  createRequestId: jest.fn(() => 'mock-request-id'),
}));

describe('API Factory Tests', () => {
  const mockNetworkConfig = {
    minimumThreshold: 3,
    network: 'test-network',
    rpcUrl: 'http://test-rpc',
    abiSignatures: {},
    chainConfig: {} as any,
    httpProtocol: 'https://' as const,
    networkSpecificConfigs: {},
    endpoints: {
      PKP_SIGN: '/web/pkp/sign',
      ENCRYPTION_SIGN: '/web/encryption/sign',
      EXECUTE_JS: '/web/execute/v2',
    },
    services: {
      authServiceBaseUrl: 'https://test-auth.com',
      loginServiceBaseUrl: 'https://test-login.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPKPSignAPI', () => {
    it('should create PKP sign API with correct methods', () => {
      const api = createPKPSignAPI(mockNetworkConfig);

      expect(api).toBeDefined();
      expect(typeof api.createRequest).toBe('function');
      expect(typeof api.handleResponse).toBe('function');
    });

    it('should use network config endpoints', () => {
      const api = createPKPSignAPI(mockNetworkConfig);
      expect(api).toBeDefined();
      // The actual endpoint usage would be tested in integration tests
    });
  });

  describe('createDecryptAPI', () => {
    it('should create decrypt API with correct methods', () => {
      const api = createDecryptAPI(mockNetworkConfig);

      expect(api).toBeDefined();
      expect(typeof api.createRequest).toBe('function');
      expect(typeof api.handleResponse).toBe('function');
    });
  });

  describe('createExecuteJsAPI', () => {
    it('should create execute JS API with correct methods', () => {
      const api = createExecuteJsAPI(mockNetworkConfig);

      expect(api).toBeDefined();
      expect(typeof api.createRequest).toBe('function');
      expect(typeof api.handleResponse).toBe('function');
    });
  });

  describe('API Factory Pattern', () => {
    it('should create independent API instances for different configs', () => {
      const config1 = { ...mockNetworkConfig, network: 'network-1' };
      const config2 = { ...mockNetworkConfig, network: 'network-2' };

      const api1 = createPKPSignAPI(config1);
      const api2 = createPKPSignAPI(config2);

      // Should be different instances
      expect(api1).not.toBe(api2);
      expect(api1.createRequest).not.toBe(api2.createRequest);
    });

    it('should work with different environment configurations', () => {
      const devConfig = {
        ...mockNetworkConfig,
        network: 'naga-dev',
        services: {
          authServiceBaseUrl: 'https://naga-auth-service.getlit.dev',
          loginServiceBaseUrl: 'https://login.litgateway.com',
        },
        httpProtocol: 'https://' as const,
      };

      const localConfig = {
        ...mockNetworkConfig,
        network: 'custom',
        services: {
          authServiceBaseUrl: 'http://localhost:3301',
          loginServiceBaseUrl: 'http://localhost:3300',
        },
        httpProtocol: 'http://' as const,
      };

      const devAPI = createPKPSignAPI(devConfig);
      const localAPI = createPKPSignAPI(localConfig);

      expect(devAPI).toBeDefined();
      expect(localAPI).toBeDefined();
      expect(devAPI).not.toBe(localAPI);
    });
  });

  describe('Configuration Validation', () => {
    it('should handle network configs with different signatures', () => {
      const configWithSignatures = {
        ...mockNetworkConfig,
        abiSignatures: {
          someContract: {
            address: '0x123',
            abi: [],
          },
        },
      };

      expect(() => createPKPSignAPI(configWithSignatures)).not.toThrow();
      expect(() => createDecryptAPI(configWithSignatures)).not.toThrow();
      expect(() => createExecuteJsAPI(configWithSignatures)).not.toThrow();
    });

    it('should work with minimum threshold variations', () => {
      const configWithDifferentThreshold = {
        ...mockNetworkConfig,
        minimumThreshold: 5,
      };

      const api = createPKPSignAPI(configWithDifferentThreshold);
      expect(api).toBeDefined();
    });
  });
});
