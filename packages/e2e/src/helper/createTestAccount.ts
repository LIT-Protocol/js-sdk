import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { TestEnv } from './createTestEnv';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { getOrCreatePkp } from './pkp-utils';
import { PKPData } from '@lit-protocol/schemas';
import { fundAccount } from './fundAccount';
import { AuthContext } from '../types';
import { parseEther } from 'viem/utils';

type CreateTestAccountOpts = {
  label: string;
  fundAccount: boolean;
  fundLedger: boolean;
  hasPKP: boolean;
  fundPKP: boolean;
  fundPKPLedger: boolean;
  sponsor?: {
    restrictions: {
      totalMaxPriceInWei: string;
      requestsPerPeriod: string;
      periodSeconds: string;
    };
    userAddresses: string[] | `0x${string}`[];
  };
};

export type CreateTestAccountResult = {
  account: ReturnType<typeof privateKeyToAccount>;
  pkp?: PKPData;
  eoaAuthContext?: AuthContext;
  pkpAuthContext?: AuthContext;
  pkpViemAccount?: Awaited<
    ReturnType<TestEnv['litClient']['getPkpViemAccount']>
  >;
};

export async function createTestAccount(
  testEnv: TestEnv,
  opts: CreateTestAccountOpts
): Promise<CreateTestAccountResult> {
  console.log(`--- ${`[${opts.label}]`} Creating test account ---`);
  // 1. store result
  let person: CreateTestAccountResult = {
    account: privateKeyToAccount(generatePrivateKey()),
  };

  const personAccountAuthData = await ViemAccountAuthenticator.authenticate(
    person.account
  );
  console.log(`Address`, person.account.address);
  console.log(`opts:`, opts);

  // 3. fund it
  if (opts.fundAccount) {
    await fundAccount(
      person.account,
      testEnv.masterAccount,
      testEnv.networkModule,
      {
        label: 'owner',
        ifLessThan: testEnv.config.nativeFundingAmount,
        thenFund: testEnv.config.nativeFundingAmount,
      }
    );

    // -- create EOA auth context
    person.eoaAuthContext = await testEnv.authManager.createEoaAuthContext({
      config: {
        account: person.account,
      },
      authConfig: {
        statement: 'I authorize the Lit Protocol to execute this Lit Action.',
        domain: 'example.com',
        resources: [
          ['lit-action-execution', '*'],
          ['pkp-signing', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: testEnv.litClient,
    });
  } // ... end if fundAccount

  // 4. also fund the ledger
  if (opts.fundLedger) {
    await testEnv.masterPaymentManager.depositForUser({
      userAddress: person.account.address,
      amountInEth: testEnv.config.ledgerDepositAmount,
    });
  }

  // 5. create PKP
  if (opts.hasPKP) {
    person.pkp = await getOrCreatePkp(
      testEnv.litClient,
      personAccountAuthData,
      person.account
    );

    // 7. fund the PKP
    if (opts.fundPKP) {
      await fundAccount(
        person.pkp.ethAddress as `0x${string}`,
        testEnv.masterAccount,
        testEnv.networkModule,
        {
          label: 'PKP',
          ifLessThan: testEnv.config.nativeFundingAmount,
          thenFund: testEnv.config.nativeFundingAmount,
        }
      );
    }

    // 8. also fund PKP Ledger
    if (opts.fundPKPLedger) {
      await testEnv.masterPaymentManager.depositForUser({
        userAddress: person.pkp.ethAddress as `0x${string}`,
        amountInEth: testEnv.config.ledgerDepositAmount,
      });
    }

    // Create PKP auth context
    person.pkpAuthContext = await testEnv.authManager.createPkpAuthContext({
      authData: personAccountAuthData,
      pkpPublicKey: person.pkp.pubkey,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        // 30m expiration
        expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      },
      litClient: testEnv.litClient,
    });

    // Create PKP viem account
    person.pkpViemAccount = await testEnv.litClient.getPkpViemAccount({
      pkpPublicKey: person.pkp.pubkey,
      authContext: person.pkpAuthContext,
      chainConfig: testEnv.networkModule.getChainConfig(),
    });
  } // ... end if hasPKP

  if (opts.sponsor) {
    // 1. get payment manager
    const personPaymentManager = await testEnv.litClient.getPaymentManager({
      account: person.account,
    });

    // 2. Set Restrictions

    // Convert to Wei using Viem
    // const wei = parseEther(opts.sponsor.restrictions.totalMaxPriceInEth);

    // console.log(`- Setting sponsorship restrictions:`, {
    //   totalMaxPriceInEth: opts.sponsor.restrictions.totalMaxPriceInEth,
    //   totalMaxPriceInWei: wei.toString(),
    //   requestsPerPeriod: opts.sponsor.restrictions.requestsPerPeriod,
    //   periodSeconds: opts.sponsor.restrictions.periodSeconds,
    // });
    try {
      const tx = await personPaymentManager.setRestriction({
        // totalMaxPrice: wei.toString(),
        totalMaxPrice: opts.sponsor.restrictions.totalMaxPriceInWei,
        requestsPerPeriod: opts.sponsor.restrictions.requestsPerPeriod,
        periodSeconds: opts.sponsor.restrictions.periodSeconds,
      });
      console.log(`- [setRestriction] TX Hash: ${tx.hash}`);
    } catch (e) {
      throw new Error(`❌ Failed to set sponsorship restrictions: ${e}`);
    }

    // 3. Sponsor users
    const userAddresses = opts.sponsor.userAddresses;
    if (!userAddresses || userAddresses.length === 0) {
      throw new Error(
        '❌ User addresses are required for the sponsor to fund.'
      );
    }

    try {
      console.log(`- Sponsoring users:`, userAddresses);
      const tx = await personPaymentManager.delegatePaymentsBatch({
        userAddresses: userAddresses,
      });
      console.log(`[delegatePaymentsBatch] TX Hash: ${tx.hash}`);
    } catch (e) {
      throw new Error(`❌ Failed to delegate sponsorship to users: ${e}`);
    }
  }

  return person;
}
