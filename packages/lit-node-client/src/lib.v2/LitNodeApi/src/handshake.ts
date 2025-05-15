import { LIT_ENDPOINT } from '@lit-protocol/constants';
import { HexSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { sendNodeRequest } from './helper/sendNodeRequest';

// Assuming CoreNodeConfig might be defined in a shared types package or needs to be defined here.
// For now, let's use a placeholder or assume it's available via @lit-protocol/types.
// If it's specific to lit-client's usage, this might need adjustment.
// import { CoreNodeConfig } from '@lit-protocol/types'; // Placeholder, adjust if CoreNodeConfig is elsewhere
// Replicating the CoreNodeConfig interface definition from lit-client/src/index.ts for clarity
// Ideally, this would be a shared type.
export interface ResolvedHandshakeResponse {
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
  hdRootPubkeys: string[];
  latestBlockhash: string;
  // lastBlockHashRetrieved: number;
}

// Assuming mostCommonValue is a utility function, e.g., from @lit-protocol/utils
import { mostCommonValue } from '../../helper/most-common-value'; // Corrected path

// Assuming InvalidEthBlockhash is an error class, e.g., from @lit-protocol/errors
import { InvalidEthBlockhash } from '@lit-protocol/constants'; // Corrected path
import { composeLitUrl } from '@lit-protocol/lit-node-client';

// Interface for the handshake-specific payload
interface HandshakeRequestData {
  clientPublicKey: string;
  challenge: string;
  // Potentially epoch if needed at this level
}

// Expected response type for handshake from the node (raw structure)
export const RawHandshakeResponseSchema = z.object({
  serverPublicKey: z.string(),
  subnetPublicKey: z.string(),
  networkPublicKey: z.string(),
  networkPublicKeySet: z.string(),
  clientSdkVersion: z.string(),
  hdRootPubkeys: z.array(z.string()),
  attestation: z.any().optional(), // ❗️ Attestation data if provided by node. <network>-dev version will be null.
  latestBlockhash: HexSchema,
  nodeVersion: z.string(),
  epoch: z.number(),
});

export type RawHandshakeResponse = z.infer<typeof RawHandshakeResponseSchema>;

/**
 * Performs a handshake request with a single Lit node.
 * @param url Base URL of the node.
 * @param data Handshake specific data (challenge, clientPublicKey).
 * @param requestId Unique request identifier.
 * @returns The raw handshake response from the node.
 */
export const handshake = async (params: {
  url: string;
  data: HandshakeRequestData;
  requestId: string;
  epoch: number;
  version: string;
}): Promise<RawHandshakeResponse> => {
  const fullPath = composeLitUrl({
    url: params.url!,
    endpoint: LIT_ENDPOINT.HANDSHAKE,
  });

  return RawHandshakeResponseSchema.parse(
    await sendNodeRequest<RawHandshakeResponse>({
      fullPath,
      data: params.data,
      requestId: params.requestId,
      epoch: params.epoch,
      version: params.version,
    })
  );
};

export const resolveHandshakeResponse = ({
  serverKeys,
  requestId,
}: {
  serverKeys: Record<string, RawHandshakeResponse>;
  requestId: string;
}): ResolvedHandshakeResponse => {
  const latestBlockhash = mostCommonValue(
    Object.values(serverKeys).map(
      (keysFromSingleNode) => keysFromSingleNode.latestBlockhash
    )
  );

  if (!latestBlockhash) {
    console.error(
      `Error getting latest blockhash from the nodes. Request ID: ${requestId}`
    );

    throw new InvalidEthBlockhash(
      {
        info: {
          requestId,
        },
      },
      `latestBlockhash is not available. Received: "${String(latestBlockhash)}"`
    );
  }

  // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key
  return {
    subnetPubKey: mostCommonValue(
      Object.values(serverKeys).map(
        (keysFromSingleNode) => keysFromSingleNode.subnetPublicKey
      )
    )!,
    networkPubKey: mostCommonValue(
      Object.values(serverKeys).map(
        (keysFromSingleNode) => keysFromSingleNode.networkPublicKey
      )
    )!,
    networkPubKeySet: mostCommonValue(
      Object.values(serverKeys).map(
        (keysFromSingleNode) => keysFromSingleNode.networkPublicKeySet
      )
    )!,
    hdRootPubkeys: mostCommonValue(
      Object.values(serverKeys).map(
        (keysFromSingleNode) => keysFromSingleNode.hdRootPubkeys
      )
    )!,
    latestBlockhash,
    // lastBlockHashRetrieved: Date.now(),
  };
};
