import { createLitClient } from '@lit-protocol/lit-client';
import {
  createEpochSnapshot,
  EpochSnapshot,
} from './helpers/createEpochSnapshot';

/**
 * Options used when Shiva spins up a brand-new testnet instance.
 * Values mirror the Rust manager contract; all fields are optional for our wrapper.
 */
type TestNetCreateRequest = {
  nodeCount: number;
  pollingInterval: string;
  epochLength: number;
  customBuildPath?: string | null;
  litActionServerCustomBuildPath?: string | null;
  existingConfigPath?: string | null;
  which?: string | null;
  ecdsaRoundTimeout?: string | null;
  enableRateLimiting?: string | null;
};

type TestNetResponse<T> = {
  testnetId: string;
  command: string;
  wasCanceled: boolean;
  body: T | null;
  lastStateObserved: string | null;
  messages: string[] | null;
  errors: string[] | null;
};

type TestNetState = 'Busy' | 'Active' | 'Mutating' | 'Shutdown' | 'UNKNOWN';

/**
 * Configuration accepted by {@link createShivaClient}.
 */
type CreateShivaClientOptions = {
  baseUrl: string;
  testnetId?: string;
  createRequest?: TestNetCreateRequest;
};

type FetchOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

/**
 * Options for {@link ShivaClient.waitForEpochChange}.
 */
type WaitForEpochOptions = {
  expectedEpoch: number | undefined;
  timeoutMs?: number;
  intervalMs?: number;
};

type PollTestnetStateOptions = {
  waitFor?: TestNetState | TestNetState[];
  timeoutMs?: number;
  intervalMs?: number;
};

/**
 * High-level interface surfaced by {@link createShivaClient}.
 */
export type ShivaClient = {
  baseUrl: string;
  testnetId: string;
  /** Fetch a one-off snapshot of the Lit context and per-node epochs. */
  inspectEpoch: () => Promise<EpochSnapshot>;
  /**
   * Poll the Lit client until it reports an epoch different from {@link WaitForEpochOptions.baselineEpoch}.
   * Useful immediately after triggering an epoch change via Shiva.
   */
  waitForEpochChange: (options: WaitForEpochOptions) => Promise<EpochSnapshot>;
  /** Invoke Shiva's `/test/action/transition/epoch/wait/<id>` and wait for completion. */
  transitionEpochAndWait: () => Promise<boolean>;
  /** Stop a random node and wait for the subsequent epoch change. */
  stopRandomNodeAndWait: () => Promise<boolean>;
  /** Query the current state of the managed testnet (Busy, Active, etc.). */
  /**
   * @example
   * ```ts
   * // Wait up to two minutes for the testnet to become active.
   * await client.pollTestnetState({ waitFor: 'Active', timeoutMs: 120_000 });
   * ```
   */
  pollTestnetState: (
    options?: PollTestnetStateOptions
  ) => Promise<TestNetState>;
  /** Retrieve the full testnet configuration (contract ABIs, RPC URL, etc.). */
  getTestnetInfo: () => Promise<unknown>;
  /** Shut down the underlying testnet through the Shiva manager. */
  deleteTestnet: () => Promise<boolean>;

  // Setters
  setLitClient: (
    litClient: Awaited<ReturnType<typeof createLitClient>>
  ) => void;
};

const DEFAULT_POLL_INTERVAL = 2000;
const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_STATE_POLL_INTERVAL = 2000;
const DEFAULT_STATE_POLL_TIMEOUT = 60_000;

const normaliseBaseUrl = (baseUrl: string) => {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const toJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse Shiva response as JSON (status ${response.status}): ${text}`
    );
  }
};

const fetchShiva = async <T>(
  baseUrl: string,
  path: string,
  options: FetchOptions = {}
): Promise<TestNetResponse<T>> => {
  const url = `${normaliseBaseUrl(baseUrl)}${
    path.startsWith('/') ? '' : '/'
  }${path}`;

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers:
      options.method === 'POST'
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
    body:
      options.method === 'POST' && options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  const parsed = await toJson<TestNetResponse<T>>(response);

  if (!response.ok || (parsed.errors && parsed.errors.length > 0)) {
    const message =
      parsed.errors?.join('; ') ??
      `Shiva request failed with status ${response.status}`;
    throw new Error(message);
  }

  return parsed;
};

const getTestnetIds = async (baseUrl: string): Promise<string[]> => {
  const url = `${normaliseBaseUrl(baseUrl)}/test/get/testnets`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch testnets from Shiva (status ${response.status}): ${body}`
    );
  }
  return (await response.json()) as string[];
};

const getOrCreateTestnetId = async (
  baseUrl: string,
  providedId?: string,
  createRequest?: TestNetCreateRequest
): Promise<string> => {
  if (providedId) {
    return providedId;
  }

  const existing = await getTestnetIds(baseUrl);
  if (existing.length > 0) {
    return existing[0];
  }

  if (!createRequest) {
    throw new Error(
      'No Shiva testnet is running. Provide a testnetId or a createRequest to start one.'
    );
  }

  const response = await fetchShiva<void>(baseUrl, '/test/create/testnet', {
    method: 'POST',
    body: createRequest,
  });

  if (!response.testnetId) {
    throw new Error(
      'Shiva create testnet response did not include testnetId. Received: ' +
        JSON.stringify(response)
    );
  }

  return response.testnetId;
};

/**
 * Creates a Shiva client wrapper for the provided Lit client instance.
 * The wrapper talks to the Shiva manager REST endpoints, auto-discovers (or optionally creates) a testnet,
 * and exposes helpers for triggering and validating epoch transitions.
 */
export const createShivaClient = async (
  options: CreateShivaClientOptions
): Promise<ShivaClient> => {
  const baseUrl = normaliseBaseUrl(options.baseUrl);
  const testnetId = await getOrCreateTestnetId(
    baseUrl,
    options.testnetId,
    options.createRequest
  );

  let litClientInstance:
    | Awaited<ReturnType<typeof createLitClient>>
    | undefined;

  const setLitClient = (
    client: Awaited<ReturnType<typeof createLitClient>>
  ) => {
    litClientInstance = client;
  };

  const inspectEpoch = async () => {
    if (!litClientInstance) {
      throw new Error(
        `Lit client not set. Please call setLitClient() before using inspectEpoch().`
      );
    }

    return createEpochSnapshot(litClientInstance);
  };

  const waitForEpochChange = async ({
    expectedEpoch,
    timeoutMs = DEFAULT_TIMEOUT,
    intervalMs = DEFAULT_POLL_INTERVAL,
  }: WaitForEpochOptions) => {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const snapshot = await inspectEpoch();
      if (
        snapshot.latestConnectionInfo.epochState.currentNumber !== expectedEpoch
      ) {
        return snapshot;
      }
    }

    throw new Error(
      `Epoch did not change from ${expectedEpoch} within ${timeoutMs}ms`
    );
  };

  const transitionEpochAndWait = async () => {
    const response = await fetchShiva<boolean>(
      baseUrl,
      `/test/action/transition/epoch/wait/${testnetId}`
    );
    return Boolean(response.body);
  };

  const stopRandomNodeAndWait = async () => {
    const response = await fetchShiva<boolean>(
      baseUrl,
      `/test/action/stop/random/wait/${testnetId}`
    );

    // wait briefly to allow the node to drop from the network
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return Boolean(response.body);
  };

  const pollTestnetState = async (
    options: PollTestnetStateOptions = {}
  ): Promise<TestNetState> => {
    const {
      waitFor,
      timeoutMs = DEFAULT_STATE_POLL_TIMEOUT,
      intervalMs = DEFAULT_STATE_POLL_INTERVAL,
    } = options;

    const desiredStates = Array.isArray(waitFor)
      ? waitFor
      : waitFor
      ? [waitFor]
      : undefined;
    const deadline = Date.now() + timeoutMs;

    // Continue polling until we hit a desired state or timeout.
    // If no desired state is provided, return the first observation .
    for (;;) {
      const response = await fetchShiva<string>(
        baseUrl,
        `/test/poll/testnet/${testnetId}`
      );
      const state = (response.body ?? 'UNKNOWN') as TestNetState;

      if (!desiredStates || desiredStates.includes(state)) {
        return state;
      }

      if (Date.now() >= deadline) {
        throw new Error(
          `Timed out after ${timeoutMs}ms waiting for testnet ${testnetId} to reach state ${desiredStates.join(
            ', '
          )}. Last observed state: ${state}.`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  };

  const getTestnetInfo = async () => {
    const response = await fetchShiva<unknown>(
      baseUrl,
      `/test/get/info/testnet/${testnetId}`
    );
    return response.body;
  };

  const deleteTestnet = async () => {
    const response = await fetchShiva<boolean>(
      baseUrl,
      `/test/delete/testnet/${testnetId}`
    );
    return Boolean(response.body);
  };

  return {
    baseUrl,
    testnetId,
    setLitClient,
    transitionEpochAndWait,
    stopRandomNodeAndWait,
    pollTestnetState,
    getTestnetInfo,
    deleteTestnet,

    // utils
    inspectEpoch,
    waitForEpochChange,
  };
};
