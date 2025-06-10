import { InitError, InvalidNodeAttestation } from '@lit-protocol/constants';
import * as LitNodeApi from '../LitNodeClient/LitNodeApi';

import {
  checkSevSnpAttestation,
  ReleaseVerificationConfig,
} from '@lit-protocol/crypto';
import { getChildLogger } from '@lit-protocol/logger';
import { EndPoint } from '@lit-protocol/types';
import { createRandomHexString } from '../LitNodeClient/helper/createRandomHexString';
import {
  ResolvedHandshakeResponse,
  resolveHandshakeResponse,
} from '../LitNodeClient/LitNodeApi';
import { composeLitUrl } from '../LitNodeClient/LitNodeApi/src/helper/composeLitUrl';
import { createRequestId } from './helper/createRequestId';

const _logger = getChildLogger({
  name: 'lit-client.orchestrateHandshake',
});

/**
 * @deprecated - use the one in the type package
 */
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
  releaseVerificationConfig?: ReleaseVerificationConfig;
  networkModule?: any; // Network module that provides release verification
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

      // Use Promise.all for fail-fast behavior - if any node fails quickly, we know immediately
      Promise.all(
        params.bootstrapUrls.map(async (url: string) => {
          try {
            const fullPath = composeLitUrl({
              url: url,
              endpoint: params.endpoints.HANDSHAKE,
            });

            const _data = {
              fullPath: fullPath,
              data: {
                clientPublicKey: 'test',
                challenge: createRandomHexString(64),
              },
              requestId: requestId,
              epoch: params.currentEpoch,
              version: params.version,
              networkModule: params.networkModule,
            };

            // Debug logging before handshake
            _logger.info(`🔍 About to make handshake request to: ${url}`);
            _logger.info(`🔍 Handshake request data:`, _data);
            _logger.info(`🔍 Network module details:`, {
              version: params.networkModule?.version,
              hasApiHandshakeSchemas:
                !!params.networkModule?.api?.handshake?.schemas,
              endpointHandshake: params.endpoints.HANDSHAKE,
            });

            // 1. Call the thin API
            const retrievedServerKeys = await LitNodeApi.handshake(_data);

            _logger.info(
              '🔍 Retrieved server keys from handshake:',
              retrievedServerKeys
            );
            _logger.info(
              '🔍 Type of retrieved server keys:',
              typeof retrievedServerKeys
            );
            _logger.info(
              '🔍 Keys in retrieved server keys:',
              Object.keys(retrievedServerKeys || {})
            );

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
                const releaseVerificationFn =
                  params.networkModule?.getVerifyReleaseId?.();
                await checkSevSnpAttestation(
                  retrievedServerKeys.attestation,
                  challenge,
                  url,
                  params.releaseVerificationConfig,
                  releaseVerificationFn
                );
                // 3. Store results if successful
                serverKeys[url] = retrievedServerKeys;
                connectedNodes.add(url);
                _logger.info(`✅ 1 Handshake successful for node: ${url}`);
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
              _logger.info(`✅ 2 Handshake successful for node: ${url}`);
            }

            return { url, success: true };
          } catch (error: any) {
            _logger.error(`❌ Handshake failed for node: ${url}`, {
              error: error.message,
              stack: error.stack,
              url,
            });

            // With Promise.all, any failure will cause immediate rejection
            // But we still want to check if we have enough successful connections so far
            const currentSuccessful = connectedNodes.size;
            const minimumRequired = Math.max(
              params.minimumThreshold,
              Math.floor((params.bootstrapUrls.length * 2) / 3)
            );

            if (currentSuccessful >= minimumRequired) {
              _logger.warn(
                `⚠️ Node ${url} failed, but we already have ${currentSuccessful} successful connections (threshold: ${minimumRequired}). Continuing...`
              );
              // Return success to not fail the Promise.all if we already have enough
              return {
                url,
                success: false,
                error,
                ignoredDueToThreshold: true,
              };
            }

            // If we don't have enough successful connections yet, let this failure propagate
            throw error;
          }
        })
      )
        .then((results) => {
          // Process results - this will only run if Promise.all succeeds
          const successful = results.filter((r) => r.success).map((r) => r.url);
          const failed = results.filter((r) => !r.success);

          _logger.info(
            `📊 Handshake results: ${successful.length} successful, ${failed.length} failed out of ${params.bootstrapUrls.length} total nodes`
          );
          _logger.info(`✅ Successful nodes: ${successful.join(', ')}`);

          if (failed.length > 0) {
            _logger.warn(
              `❌ Failed nodes (ignored due to threshold): ${failed
                .map((f) => f.url)
                .join(', ')}`
            );
          }

          const minimumRequired = Math.max(
            params.minimumThreshold,
            Math.floor((params.bootstrapUrls.length * 2) / 3)
          );

          if (successful.length < minimumRequired) {
            const msg = `Error: Insufficient successful handshakes. Got ${successful.length} successful connections but need at least ${minimumRequired}.`;
            throw new InitError(
              { info: { requestId, successful, failed } },
              msg
            );
          }

          _logger.info(
            `🎉 Handshake completed successfully with ${successful.length}/${params.bootstrapUrls.length} nodes (threshold: ${minimumRequired})`
          );
        })
        .catch((error) => {
          // If Promise.all fails, we need to check what we've collected so far
          const currentSuccessful = connectedNodes.size;
          const minimumRequired = Math.max(
            params.minimumThreshold,
            Math.floor((params.bootstrapUrls.length * 2) / 3)
          );

          if (currentSuccessful >= minimumRequired) {
            _logger.warn(
              `⚠️ Promise.all failed, but we have ${currentSuccessful} successful connections (threshold: ${minimumRequired}). Proceeding with partial results.`
            );
            return; // Continue execution
          }

          // If we don't have enough, rethrow the error
          throw error;
        }),
    ]).finally(() => {
      clearTimeout(timeoutHandle);
    });

    // 4. Perform Consensus if we have enough successful connections
    coreNodeConfig = resolveHandshakeResponse({
      serverKeys: serverKeys,
      requestId,
    });
  } catch (error) {
    _logger.error('Handshake orchestration failed:', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      connectedNodes: connectedNodes.size,
      totalNodes: params.bootstrapUrls.length,
    });
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
