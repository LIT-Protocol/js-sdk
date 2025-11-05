type EpochInfo = {
  epochLength: number;
  number: number;
  endTime: number;
  retries: number;
  timeout: number;
};

type EpochState = {
  currentNumber: number;
  startTime: number;
};

type NetworkPrice = {
  url: string;
  prices: Array<number | bigint>;
};

type PriceFeedInfo = {
  epochId: number;
  minNodeCount: number;
  networkPrices: NetworkPrice[];
};

type LatestConnectionInfo = {
  epochInfo: EpochInfo;
  epochState: EpochState;
  minNodeCount: number;
  bootstrapUrls: string[];
  priceFeedInfo: PriceFeedInfo;
};

type ServerKeyDetails = {
  serverPublicKey: string;
  subnetPublicKey: string;
  networkPublicKey: string;
  networkPublicKeySet: string;
  clientSdkVersion: string;
  hdRootPubkeys: string[];
  attestation?: string | null;
  latestBlockhash: string;
  nodeIdentityKey: string;
  nodeVersion: string;
  epoch: number;
};

type CoreNodeConfig = {
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
  hdRootPubkeys: string[];
  latestBlockhash: string;
};

type HandshakeResult = {
  serverKeys: Record<string, ServerKeyDetails>;
  connectedNodes: Record<string, unknown> | Set<string>;
  coreNodeConfig: CoreNodeConfig | null;
  threshold: number;
};

type EpochSnapshotSource = {
  latestConnectionInfo?: LatestConnectionInfo | null;
  handshakeResult?: HandshakeResult | null;
};

export type EpochSnapshot = EpochSnapshotSource;

export const createEpochSnapshot = async (
  litClient: Awaited<
    ReturnType<typeof import('@lit-protocol/lit-client').createLitClient>
  >
): Promise<EpochSnapshot> => {
  const ctx = await litClient.getContext();

  const snapshot = {
    latestConnectionInfo: ctx?.latestConnectionInfo,
    handshakeResult: ctx?.handshakeResult,
  };

  return snapshot;
};
