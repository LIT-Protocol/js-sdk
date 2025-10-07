/**
 * Payment Delegation API (Auth Service)
 *
 * High-level flow
 * ==================
https://www.plantuml.com/plantuml/uml/XP91RnCn48Nl_XLFEMLLLjnNIjH21GT0L0I90-8mU8V4mcj7zcpQ_7iisz76q8gRFVFj6xzvUnk5WioJnGET9tPopvRt9CQxTzO_gcFg6csEv0GhRKqYLg28j_dOjccM0oA7az6SeRjKs9LxIreZA6AOoD6UG-O_bVDBR6O-6dbkzh6ylf6hZYwg8mdzfCXOrGOMhz3UII1TpTMBKfiDll3UHE60D883DXjLvgFVNXiSyF1vznMlGyNxWg-VUZgQ_ZUVE-MyCFo9GxCOu3qx3YHS9knO1nO5t7Cm9yOZMSk2Ny5Fc1nFtXcD6oHL95N5RaGIPdMbYRxVreI68lejYzoDO-0OSNCzwGEViy-w3COSESJ_-gHnx0kvM7nLTFkOXKibCzz_TEtxjfUi1-ov1hhkL2sc_fBpW2H6mccpSsnjjbWIQXDVazP-TjAfIXKpBJJ0k2Zan52xnEVGiUwerkCR4drOPukTQk3iuV8VBHyYi_-WVwzOdd2WU7WnqpXhNOAyaBVindcoVm00
 * ```
 *
 * Behaviour
 * ---------
 * - Accepts two routes: `POST /register-payer` and `POST /add-users`.
 * - Uses a deterministic derivation (`m/44'/60'/0'/0/{index}`) based on the
 *   delegation mnemonic, `x-api-key`, and a generated `payerSecretKey` so the same
 *   headers always map to the same payer wallet.
 * - Lazily instantiates a Lit client on first use and tears it down after an idle
 *   timeout (default 5 minutes) unless a worker process has already provided a
 *   global `systemContext.litClient`, which is reused.
 * - Delegation execution is performed via the SDK `PaymentManager` abstraction,
 *   which handles contract calls to the Payment Delegation facet.
 */

import { createLitClient } from '@lit-protocol/lit-client';
import { getChildLogger } from '@lit-protocol/logger';
import {
  LitNetworkModule,
  nagaDev,
  nagaLocal,
  nagaStaging,
  nagaTest,
  PaymentManager,
} from '@lit-protocol/networks';
import { Express } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { isAddress } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import type { AppConfig } from '../providers/env';

const logger = getChildLogger({ name: 'paymentRoutes' });

// Lit networks that expose the payment delegation facet we rely on.
const SUPPORTED_NETWORKS = [
  'naga-dev',
  'naga-test',
  'naga-staging',
  'naga-local',
] as const;

type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

const isSupportedNetwork = (value: string): value is SupportedNetwork =>
  SUPPORTED_NETWORKS.includes(value as SupportedNetwork);

/** Map network identifiers to their Lit network modules. */
const NETWORK_MODULES: Record<SupportedNetwork, LitNetworkModule> = {
  'naga-dev': nagaDev,
  'naga-test': nagaTest,
  'naga-staging': nagaStaging,
  'naga-local': nagaLocal,
};

/**
 * Limit the derivation index to 2^31 - 1 so the final segment stays within the
 * non-hardened range expected by the BIP44 path (m / 44' / 60' / 0' / 0 / i).
 */
const HD_PATH_MODULO = 2n ** 31n - 1n;

/** Disconnect the lazily created Lit client after five minutes of inactivity. */
const DEFAULT_IDLE_DISCONNECT_MS = 5 * 60 * 1000;

type ManagedLitClient = Awaited<ReturnType<typeof createLitClient>>;

// Wire up the correct network configuration or throw if the service is misconfigured.
const resolveNetworkModule = (network?: string): LitNetworkModule => {
  if (!network) {
    throw new Error(
      'NETWORK environment variable must be provided for payment delegation.'
    );
  }

  const normalised = network.toLowerCase();

  if (!isSupportedNetwork(normalised)) {
    throw new Error(
      `Unsupported Lit network '${network}' for payment delegation routes.`
    );
  }

  return NETWORK_MODULES[normalised];
};

// Reuse the worker’s Lit client when present to avoid redundant connections.
const getSharedSystemContextClient = (): ManagedLitClient | undefined => {
  const maybeContext = (globalThis as any)?.systemContext;
  if (maybeContext?.litClient) {
    return maybeContext.litClient as ManagedLitClient;
  }

  return undefined;
};

// Manage a lazily instantiated Lit client with an idle timeout.
const createLitClientManager = (networkModule: LitNetworkModule) => {
  let litClientPromise: Promise<ManagedLitClient> | null = null;
  let managedClient: ManagedLitClient | undefined;
  let idleTimer: NodeJS.Timeout | null = null;

  const idleTimeoutMs = Number(
    process.env.PAYMENT_LIT_CLIENT_IDLE_MS ?? DEFAULT_IDLE_DISCONNECT_MS
  );

  const clearIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const scheduleIdleDisconnect = () => {
    if (!managedClient) return;
    const sharedClient = getSharedSystemContextClient();
    if (sharedClient && sharedClient === managedClient) {
      // Do not disconnect the worker's shared client.
      return;
    }

    if (typeof managedClient.disconnect !== 'function') return;

    clearIdleTimer();
    idleTimer = setTimeout(async () => {
      try {
        logger.info('Disconnecting idle payment Lit client');
        await managedClient!.disconnect();
      } catch (err) {
        logger.warn({ err }, 'Failed to disconnect idle payment Lit client');
      } finally {
        litClientPromise = null;
        managedClient = undefined;
        clearIdleTimer();
      }
    }, idleTimeoutMs);

    idleTimer.unref?.();
  };

  const getClient = async (): Promise<ManagedLitClient> => {
    const sharedClient = getSharedSystemContextClient();
    if (sharedClient) {
      managedClient = sharedClient;
      return sharedClient;
    }

    if (!litClientPromise) {
      logger.info('Bootstrapping Lit client for payment delegation routes');
      litClientPromise = createLitClient({ network: networkModule });
    }

    managedClient = await litClientPromise;
    scheduleIdleDisconnect();
    return managedClient;
  };

  const markUsed = () => {
    if (!managedClient) return;
    const sharedClient = getSharedSystemContextClient();
    if (sharedClient && sharedClient === managedClient) {
      return;
    }
    scheduleIdleDisconnect();
  };

  const shutdown = async () => {
    clearIdleTimer();

    if (!litClientPromise) {
      return;
    }

    try {
      const client = await litClientPromise;
      const sharedClient = getSharedSystemContextClient();
      if (client === sharedClient) {
        return;
      }
      if (typeof client.disconnect === 'function') {
        await client.disconnect();
      }
    } catch (err) {
      logger.warn({ err }, 'Error while shutting down payment Lit client');
    } finally {
      litClientPromise = null;
      managedClient = undefined;
    }
  };

  return {
    getClient,
    markUsed,
    shutdown,
  };
};

// Hash the API key + secret into a deterministic index within the allowed path range.
const computeDerivationIndex = (seed: string): bigint => {
  const hash = createHash('sha256').update(seed).digest('hex');
  const numericHash = BigInt(`0x${hash}`);
  return numericHash % HD_PATH_MODULO;
};

/**
 * Derive a deterministic payer account from the service mnemonic and headers.
 * The path mirrors the historical relay server implementation to preserve wallet continuity.
 */
const derivePayerAccount = ({
  apiKey,
  payerSecret,
  mnemonic,
}: {
  apiKey: string;
  payerSecret: string;
  mnemonic: string;
}) => {
  const derivationIndex = computeDerivationIndex(`${apiKey}${payerSecret}`);
  // Follow the standard Ethereum BIP44 path while swapping in the per-user index.
  const path =
    `m/44'/60'/0'/0/${derivationIndex.toString()}` as `m/44'/60'/${string}`;
  const account = mnemonicToAccount(mnemonic, { path });

  return {
    account,
    address: account.address,
  };
};

export const registerPaymentRoutes = (app: Express, cfg: AppConfig) => {
  const baseNetworkModule = resolveNetworkModule(cfg.network);

  const paymentNetworkModule = (() => {
    if (cfg.litTxsenderRpcUrl) {
      try {
        return baseNetworkModule.withOverrides({
          rpcUrl: cfg.litTxsenderRpcUrl,
        });
      } catch (err) {
        logger.error(
          { err, rpcUrl: cfg.litTxsenderRpcUrl },
          'Failed to apply RPC override to network module'
        );
        return baseNetworkModule;
      }
    }

    return baseNetworkModule;
  })();

  const clientManager = createLitClientManager(paymentNetworkModule);

  const getPaymentManager = async (
    account: ReturnType<typeof derivePayerAccount>['account']
  ): Promise<PaymentManager> => {
    const litClient = await clientManager.getClient();
    const paymentManager = await litClient.getPaymentManager({ account });
    clientManager.markUsed();
    return paymentManager;
  };

  const shutdown = async () => {
    await clientManager.shutdown();
  };

  // Keep process shutdown clean so the idle connection doesn’t linger.
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      shutdown().catch((err) =>
        logger.warn(
          { err, signal },
          'Failed to shutdown payment routes gracefully'
        )
      );
    });
  }

  app.post('/register-payer', async (req, res) => {
    try {
      const apiKey = req.header('x-api-key');

      if (!apiKey) {
        return res
          .status(400)
          .json({ success: false, error: 'Missing x-api-key header' });
      }

      if (!cfg.litDelegationRootMnemonic) {
        logger.error('LIT_DELEGATION_ROOT_MNEMONIC not set');
        return res.status(500).json({
          success: false,
          error: 'Payment delegation not configured on this service',
        });
      }

      // Generate a unique secret so we can deterministically derive the delegate wallet later.
      const payerSecret = randomBytes(64).toString('base64');
      const { address } = derivePayerAccount({
        apiKey,
        payerSecret,
        mnemonic: cfg.litDelegationRootMnemonic,
      });

      logger.info({ address }, 'Registered payer wallet');

      return res.status(200).json({
        success: true,
        payerWalletAddress: address,
        payerSecretKey: payerSecret,
      });
    } catch (err) {
      logger.error({ err }, 'Failed to register payer');
      return res.status(500).json({
        success: false,
        error: 'Failed to register payer',
      });
    }
  });

  app.post('/add-users', async (req, res) => {
    try {
      const apiKey = req.header('x-api-key');
      const payerSecret = req.header('payer-secret-key');
      const payeeAddresses = req.body;

      if (!apiKey || !payerSecret) {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid x-api-key / payer-secret-key headers',
        });
      }

      if (!cfg.litDelegationRootMnemonic) {
        logger.error('LIT_DELEGATION_ROOT_MNEMONIC not set');
        return res.status(500).json({
          success: false,
          error: 'Payment delegation not configured on this service',
        });
      }

      // Basic shape validation before we hit the chain.
      if (!Array.isArray(payeeAddresses) || payeeAddresses.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body must be a non-empty array of user addresses',
        });
      }

      const invalidAddress = payeeAddresses.find(
        (address) => typeof address !== 'string' || !isAddress(address.trim())
      );

      if (invalidAddress) {
        return res.status(400).json({
          success: false,
          error: `Invalid Ethereum address provided: ${invalidAddress}`,
        });
      }

      const { account, address } = derivePayerAccount({
        apiKey,
        payerSecret,
        mnemonic: cfg.litDelegationRootMnemonic,
      });

      // Delegate the heavy lifting to the PaymentManager abstraction.
      const paymentManager = await getPaymentManager(account);
      const tx = await paymentManager.delegatePaymentsBatch({
        userAddresses: payeeAddresses.map((entry: string) => entry.trim()),
      });

      logger.info(
        {
          payerAddress: address,
          payees: payeeAddresses,
          txHash: tx.hash,
        },
        'Delegated payments to users'
      );

      clientManager.markUsed();

      return res.status(200).json({
        success: true,
        txHash: tx.hash,
        message:
          'Transaction submitted successfully. Confirmation will happen in the background.',
      });
    } catch (err) {
      logger.error({ err }, 'Failed to add payees');

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add payees';

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });
};
