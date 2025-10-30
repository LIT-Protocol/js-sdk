import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev } from '@lit-protocol/networks';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { Account } from 'viem';
import { fundAccount } from '../helper/fundAccount';

const NETWORK_MODULE = nagaDev;
const LIVE_MASTER_ACCOUNT = process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`;
const LIVE_NETWORK_FUNDING_AMOUNT = '0.01';

describe('JSS-11: PKP Management and Pagination', () => {
  let masterViemAccount: Account;
  let randomViemAccount: Account;
  let viemAccountAuthData: Awaited<
    ReturnType<typeof ViemAccountAuthenticator.authenticate>
  >;
  let litClient: Awaited<ReturnType<typeof createLitClient>>;

  beforeAll(async () => {
    // ---------- Authentication Layer ----------
    masterViemAccount = privateKeyToAccount(LIVE_MASTER_ACCOUNT);
    randomViemAccount = privateKeyToAccount(generatePrivateKey());

    await fundAccount(randomViemAccount, masterViemAccount, NETWORK_MODULE, {
      ifLessThan: '0',
      thenFund: LIVE_NETWORK_FUNDING_AMOUNT,
    });

    viemAccountAuthData = await ViemAccountAuthenticator.authenticate(
      randomViemAccount
    );

    // ---------- Client Setup Layer ----------
    litClient = await createLitClient({
      network: NETWORK_MODULE,
    });
  });

  describe('Initial State Tests', () => {
    it('should return empty array for new account with no PKPs', async () => {
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 10, offset: 0 },
      });

      expect(result.pkps.length).toBe(0);
    });
  });

  describe('PKP Creation and Management', () => {
    it('should mint first PKP successfully', async () => {
      // Mint PKP
      await litClient.mintWithAuth({
        account: randomViemAccount,
        authData: viemAccountAuthData,
        scopes: ['sign-anything'],
      });

      // Verify PKP exists
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 10, offset: 0 },
      });

      expect(result.pkps.length).toBe(1);
    });

    it('should mint second PKP and return both PKPs', async () => {
      // Mint second PKP
      await litClient.mintWithAuth({
        account: randomViemAccount,
        authData: viemAccountAuthData,
        scopes: ['sign-anything'],
      });

      // Verify both PKPs exist
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 10, offset: 0 },
      });

      expect(result.pkps.length).toBe(2);
    });
  });

  describe('Pagination Functionality', () => {
    it('should respect limit parameter', async () => {
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 1, offset: 0 },
      });

      expect(result.pkps.length).toBe(1);
    });

    it('should respect offset parameter and return different PKPs', async () => {
      // Get first PKP
      const firstResult = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 1, offset: 0 },
      });

      // Get second PKP
      const secondResult = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 1, offset: 1 },
      });

      expect(firstResult.pkps.length).toBe(1);
      expect(secondResult.pkps.length).toBe(1);
      expect(firstResult.pkps[0].tokenId).not.toBe(
        secondResult.pkps[0].tokenId
      );
    });

    it('should handle large limit values correctly', async () => {
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 100, offset: 0 },
      });

      // Should return all PKPs (currently 2)
      expect(result.pkps.length).toBe(2);
    });

    it('should handle offset beyond available PKPs', async () => {
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 10, offset: 10 },
      });

      expect(result.pkps.length).toBe(0);
    });
  });

  describe('Data Consistency Tests', () => {
    it('should return consistent results across multiple calls', async () => {
      // Get PKPs multiple times
      const firstCall = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 10, offset: 0 },
      });

      const secondCall = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 10, offset: 0 },
      });

      expect(secondCall.pkps.length).toBe(firstCall.pkps.length);
      expect(secondCall.pkps.map((p) => p.tokenId).sort()).toEqual(
        firstCall.pkps.map((p) => p.tokenId).sort()
      );
    });

    it('should maintain correct PKP data structure', async () => {
      const result = await litClient.viewPKPsByAuthData({
        authData: viemAccountAuthData,
        pagination: { limit: 1, offset: 0 },
      });

      expect(result.pkps.length).toBe(1);
      const pkp = result.pkps[0];

      // Verify PKP has required properties
      expect(pkp).toHaveProperty('tokenId');
      expect(pkp).toHaveProperty('publicKey');
      expect(pkp).toHaveProperty('ethAddress');

      // Verify data types
      expect(typeof pkp.tokenId).toBe('string');
      expect(typeof pkp.pubkey).toBe('string');
      expect(typeof pkp.ethAddress).toBe('string');

      // Verify format
      expect(pkp.pubkey).toMatch(/^0x[a-fA-F0-9]+$/);
      expect(pkp.ethAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});
