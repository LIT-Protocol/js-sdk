import { InitError, InvalidNodeAttestation } from '@lit-protocol/constants';
import * as LitNodeApi from '../LitNodeClient/LitNodeApi';

import { getChildLogger } from '@lit-protocol/logger';
import { EndPoint } from '@lit-protocol/types';
import { createRandomHexString } from '../LitNodeClient/helper/createRandomHexString';
import { checkSevSnpAttestation } from '@lit-protocol/crypto';
import {
  ResolvedHandshakeResponse,
  resolveHandshakeResponse,
} from '../LitNodeClient/LitNodeApi';
import { composeLitUrl } from '../LitNodeClient/LitNodeApi/src/helper/composeLitUrl';
import { createRequestId } from './helper/createRequestId';

const _logger = getChildLogger({
  name: 'lit-client.orchestrateHandshake',
});

export type OrchestrateHandshakeResponse = {
  serverKeys: Record<string, LitNodeApi.RawHandshakeResponse>;
  connectedNodes: Set<string>;
  coreNodeConfig: ResolvedHandshakeResponse | null;
  threshold: number;
};

export const orchestrateHandshake = async (params: {
  bootstrapUrls: string[];
  currentEpoch: number;
  version: string;
  requiredAttestation: boolean;
  minimumThreshold: number;
  abortTimeout: number;
  endpoints: EndPoint;
}): Promise<OrchestrateHandshakeResponse> => {
  _logger.info('🌶️ orchestrating handshake...');

  // -- States --
  const serverKeys: Record<string, LitNodeApi.RawHandshakeResponse> = {}; // Store processed keys
  const connectedNodes = new Set<string>();
  const requestId = createRequestId();
  let timeoutHandle: ReturnType<typeof setTimeout>;
  let coreNodeConfig: ResolvedHandshakeResponse | null = null;

  try {
    await Promise.race([
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          const msg = `Error: Could not handshake with nodes after timeout of ${
            params.abortTimeout
          }ms. Could only connect to ${Object.keys(serverKeys).length} of ${
            params.bootstrapUrls.length
          } nodes. Please check your network connection and try again. Note that you can control this timeout with the connectTimeout config option which takes milliseconds.`;
          reject(new InitError({ info: { requestId } }, msg));
        }, params.abortTimeout);
      }),
      Promise.all(
        params.bootstrapUrls.map(async (url: string) => {
          try {
            const fullPath = composeLitUrl({
              url: url,
              endpoint: params.endpoints.HANDSHAKE,
            });

            // 1. Call the thin API
            const retrievedServerKeys = await LitNodeApi.handshake({
              fullPath: fullPath,
              data: {
                clientPublicKey: 'test',
                challenge: createRandomHexString(64),
              },
              requestId: requestId,
              epoch: params.currentEpoch,
              version: params.version,
            });

            // 2. Process the response (verify attestation etc.)
            if (params.requiredAttestation) {
              const challenge = createRandomHexString(64);

              if (!retrievedServerKeys.attestation) {
                throw new InvalidNodeAttestation(
                  {},
                  `Missing attestation in handshake response from ${url}`
                );
              }

              // Verify the attestation by checking the signature against AMD certs
              try {
                await checkSevSnpAttestation(
                  retrievedServerKeys.attestation,
                  challenge,
                  url
                );
                // 3. Store results if successful
                serverKeys[url] = retrievedServerKeys;
                connectedNodes.add(url);
              } catch (error: any) {
                throw new InvalidNodeAttestation(
                  {
                    cause: error,
                  },
                  `Lit Node Attestation failed verification for ${url} - ${error.message}`
                );
              }
            } else {
              serverKeys[url] = retrievedServerKeys;
              connectedNodes.add(url);
            }

            // logger.debug({ handshakeRequestId, url }, 'Handshake successful for node.');
          } catch (error: any) {
            // logger.error({ handshakeRequestId, url, error }, `Handshake failed for node.`);
            // Decide whether to collect errors or let Promise.all reject
            // For now, let it potentially fail the Promise.all
            throw error;
          }
        })
      ).finally(() => {
        clearTimeout(timeoutHandle);
      }),
    ]);

    // 4. Perform Consensus if Promise.all succeeded
    coreNodeConfig = resolveHandshakeResponse({
      serverKeys: serverKeys,
      requestId,
    });
  } catch (error) {
    // logger.error({ requestId, error }, 'Handshake orchestration failed.');
    // Cleanup? Stop state manager?
    throw error; // Rethrow for the caller
  } finally {
    // @ts-ignore
    clearTimeout(timeoutHandle!);
  }

  // gimme the large value between MINIMUM_THRESHOLD or 2/3 of the connected nodes
  // See rust/lit-node/common/lit-node-testnet/src/validator.rs > threshold for more details
  const threshold = Math.max(
    params.minimumThreshold,
    Math.floor((connectedNodes.size * 2) / 3)
  );

  const result = {
    serverKeys,
    connectedNodes,
    coreNodeConfig,
    threshold,
  };

  _logger.info(`🌶️ orchestrateHandshake result ${JSON.stringify(result)}`);

  return result;
};
