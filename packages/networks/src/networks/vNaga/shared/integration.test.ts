import { describe, it, expect } from '@jest/globals';
import { BaseNetworkEnvironment } from '../envs/base/BaseNetworkEnvironment';
import { nagaDevSignatures } from '@lit-protocol/contracts';
import * as chainInfo from '../../../chains/ChronicleYellowstone';
import { NAGA_ENDPOINT } from './managers/endpoints-manager/endpoints';

// Mock implementation for testing
class TestEnvironment extends BaseNetworkEnvironment<
  typeof nagaDevSignatures,
  { realmId?: bigint }
> {
  constructor() {
    super({
      network: 'test',
      abiSignatures: nagaDevSignatures,
      networkSpecificConfigs: { realmId: 1n },
      services: {
        authServiceBaseUrl: 'https://test-auth.example.com',
        loginServiceBaseUrl: 'https://test-login.example.com',
      },
      minimumThreshold: 3,
      httpProtocol: 'https://',
    });
  }

  protected getRpcUrl(): string {
    return chainInfo.RPC_URL;
  }

  protected getChainConfig() {
    return chainInfo.viemChainConfig;
  }

  protected getEndpoints() {
    return NAGA_ENDPOINT;
  }

  protected getDefaultRealmId(): bigint {
    return 1n;
  }
}

describe('Shared Architecture Integration Tests', () => {
  describe('BaseNetworkEnvironment', () => {
    it('should create environment with correct configuration', () => {
      const testEnv = new TestEnvironment();
      const config = testEnv.getConfig();

      expect(config.network).toBe('test');
      expect(config.minimumThreshold).toBe(3);
      expect(config.httpProtocol).toBe('https://');
      expect(config.services.authServiceBaseUrl).toBe(
        'https://test-auth.example.com'
      );
      expect(config.services.loginServiceBaseUrl).toBe(
        'https://test-login.example.com'
      );
      expect(config.networkSpecificConfigs?.realmId).toBe(1n);
    });

    it('should provide environment-specific getters', () => {
      const testEnv = new TestEnvironment();

      expect(testEnv.getNetworkName()).toBe('test');
      expect(testEnv.getMinimumThreshold()).toBe(3);
      expect(testEnv.getServices()).toEqual({
        authServiceBaseUrl: 'https://test-auth.example.com',
        loginServiceBaseUrl: 'https://test-login.example.com',
      });
    });

    it('should have correct ABI signatures', () => {
      const testEnv = new TestEnvironment();
      const config = testEnv.getConfig();

      expect(config.abiSignatures).toBeDefined();
      expect(typeof config.abiSignatures).toBe('object');
    });

    it('should have correct endpoints configuration', () => {
      const testEnv = new TestEnvironment();
      const config = testEnv.getConfig();

      expect(config.endpoints).toBeDefined();
      expect(config.endpoints).toBe(NAGA_ENDPOINT);
    });
  });

  describe('Environment Isolation', () => {
    it('should create independent environment instances', () => {
      const env1 = new TestEnvironment();
      const env2 = new TestEnvironment();

      // Should be separate instances
      expect(env1).not.toBe(env2);

      // But should have identical configurations
      expect(env1.getConfig()).toEqual(env2.getConfig());
    });
  });

  // Schema validation tests
  describe('Schema Exports', () => {
    it('should export pricing schema', async () => {
      const { PricingContextSchema } = await import(
        './managers/pricing-manager/PricingContextSchema'
      );
      expect(PricingContextSchema).toBeDefined();
      expect(typeof PricingContextSchema.parse).toBe('function');
    });

    it('should export API schemas', async () => {
      const { DecryptInputSchema, ExecuteJsInputSchema, PKPSignInputSchema } =
        await import('./index');

      expect(DecryptInputSchema).toBeDefined();
      expect(ExecuteJsInputSchema).toBeDefined();
      expect(PKPSignInputSchema).toBeDefined();
    });
  });
});

describe('Environment-Specific Configurations', () => {
  it('should support different protocol configurations', () => {
    class HttpTestEnvironment extends BaseNetworkEnvironment<
      typeof nagaDevSignatures,
      {}
    > {
      constructor() {
        super({
          network: 'http-test',
          abiSignatures: nagaDevSignatures,
          services: {
            authServiceBaseUrl: 'http://localhost:3301',
            loginServiceBaseUrl: 'http://localhost:3300',
          },
          httpProtocol: 'http://', // Different protocol
        });
      }

      protected getRpcUrl(): string {
        return 'http://localhost:8545';
      }
      protected getChainConfig() {
        return chainInfo.viemChainConfig;
      }
      protected getEndpoints() {
        return NAGA_ENDPOINT;
      }
      protected getDefaultRealmId(): bigint {
        return 1n;
      }
    }

    const httpEnv = new HttpTestEnvironment();
    expect(httpEnv.getConfig().httpProtocol).toBe('http://');
  });

  it('should support custom network-specific configs', () => {
    interface CustomConfig {
      realmId?: bigint;
      customField?: string;
    }

    class CustomTestEnvironment extends BaseNetworkEnvironment<
      typeof nagaDevSignatures,
      CustomConfig
    > {
      constructor() {
        super({
          network: 'custom-test',
          abiSignatures: nagaDevSignatures,
          networkSpecificConfigs: {
            realmId: 42n,
            customField: 'custom-value',
          },
          services: {
            authServiceBaseUrl: 'https://custom-auth.example.com',
            loginServiceBaseUrl: 'https://custom-login.example.com',
          },
        });
      }

      protected getRpcUrl(): string {
        return chainInfo.RPC_URL;
      }
      protected getChainConfig() {
        return chainInfo.viemChainConfig;
      }
      protected getEndpoints() {
        return NAGA_ENDPOINT;
      }
      protected getDefaultRealmId(): bigint {
        return 42n;
      }
    }

    const customEnv = new CustomTestEnvironment();
    const config = customEnv.getConfig();

    expect(config.networkSpecificConfigs?.realmId).toBe(42n);
    expect(config.networkSpecificConfigs?.customField).toBe('custom-value');
  });
});
