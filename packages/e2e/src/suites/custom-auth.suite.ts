import { utils as litUtils } from '@lit-protocol/lit-client';
import type { CustomAuthData } from '@lit-protocol/schemas';
import type { AuthContext } from '../types';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../helper/createTestAccount';
import type { TestEnv } from '../helper/createTestEnv';
import { fundAccount } from '../helper/fundAccount';
import { EVE_VALIDATION_IPFS_CID } from '../helper/constants';
import { registerEndpointSuite } from './endpoints.suite';

export function registerCustomAuthSuite(
  getTestEnv: () => TestEnv,
  getBobAccount: () => CreateTestAccountResult
) {
  describe('Custom auth', () => {
    let eve: CreateTestAccountResult;
    let evePkp: { pubkey: string; ethAddress: `0x${string}`; tokenId: bigint };
    let eveCustomAuthData: CustomAuthData;
    let eveCustomAuthContext: AuthContext;

    beforeAll(async () => {
      const testEnv = getTestEnv();

      eve = await createTestAccount(testEnv, {
        label: 'Eve',
        fundAccount: true,
        fundLedger: true,
        hasPKP: false,
        fundPKP: false,
        fundPKPLedger: false,
        hasEoaAuthContext: false,
        hasPKPAuthContext: false,
      });

      // Must match the validation Lit Action's expected dapp name.
      const uniqueDappName = 'e2e-test-dapp';
      const authMethodConfig = litUtils.generateUniqueAuthMethodType({
        uniqueDappName,
      });
      eveCustomAuthData = litUtils.generateAuthData({
        uniqueDappName,
        uniqueAuthMethodType: authMethodConfig.bigint,
        userId: 'eve',
      });

      const { pkpData } = await testEnv.litClient.mintWithCustomAuth({
        account: eve.account,
        authData: eveCustomAuthData,
        scope: 'sign-anything',
        validationIpfsCid: EVE_VALIDATION_IPFS_CID,
      });

      evePkp = {
        ...pkpData.data,
        tokenId: pkpData.data.tokenId,
        ethAddress: pkpData.data.ethAddress as `0x${string}`,
      };

      await fundAccount(
        evePkp.ethAddress,
        testEnv.masterAccount,
        testEnv.networkModule,
        {
          label: 'Eve PKP',
          ifLessThan: testEnv.config.nativeFundingAmount,
          thenFund: testEnv.config.nativeFundingAmount,
        }
      );

      await testEnv.masterPaymentManager.depositForUser({
        userAddress: evePkp.ethAddress,
        amountInEth: testEnv.config.ledgerDepositAmount,
      });

      eveCustomAuthContext = await testEnv.authManager.createCustomAuthContext({
        pkpPublicKey: evePkp.pubkey,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        },
        litClient: testEnv.litClient,
        customAuthParams: {
          litActionIpfsId: EVE_VALIDATION_IPFS_CID,
          jsParams: {
            pkpPublicKey: evePkp.pubkey,
            username: 'eve',
            password: 'lit',
            authMethodId: eveCustomAuthData.authMethodId,
          },
        },
      });
    });

    const getEveAccount = () => eve;
    const getPkpPublicKey = () => evePkp.pubkey;
    const getPkpEthAddress = () => evePkp.ethAddress;

    registerEndpointSuite(getTestEnv, () => eveCustomAuthContext, {
      getPkpPublicKey,
      getPkpEthAddress,
      getAliceAccount: getEveAccount,
      getBobAccount,
      includePaymentFlows: false,
      includeEncryptDecryptFlow: false,
      includePermissionsFlow: false,
      includeViewPkpsByAuthData: false,
    });
  });
}
