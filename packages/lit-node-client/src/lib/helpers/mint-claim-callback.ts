import {
  InvalidArgumentException,
  LIT_NETWORK,
  LIT_NETWORK_VALUES,
  NetworkError,
  RELAYER_URL_BY_NETWORK,
  WrongNetworkException,
} from '@lit-protocol/constants';
import {
  ClaimResult,
  MintCallback,
  RelayClaimProcessor,
} from '@lit-protocol/types';

/**
 * Checks if the given LIT_NETWORK value is supported.
 * @param litNetwork - The Lit Network value to check.
 * @throws {Error} - Throws an error if the Lit Network value is not supported.
 */
export function isSupportedLitNetwork(
  litNetwork: LIT_NETWORK_VALUES
): asserts litNetwork is LIT_NETWORK_VALUES {
  const supportedNetworks = Object.values(LIT_NETWORK);

  if (!supportedNetworks.includes(litNetwork)) {
    throw new WrongNetworkException(
      {
        info: {
          litNetwork,
          supportedNetworks,
        },
      },
      `Unsupported LitNetwork! (${supportedNetworks.join('|')}) are supported.`
    );
  }
}

export const defaultMintClaimCallback: MintCallback<
  RelayClaimProcessor
> = async (
  params: ClaimResult<RelayClaimProcessor>,
  network: LIT_NETWORK_VALUES = LIT_NETWORK.NagaDev
): Promise<string> => {
  isSupportedLitNetwork(network);

  const AUTH_CLAIM_PATH = '/auth/claim';

  const relayUrl: string = params.relayUrl || RELAYER_URL_BY_NETWORK[network];

  if (!relayUrl) {
    throw new InvalidArgumentException(
      {
        info: {
          network,
          relayUrl,
        },
      },
      'No relayUrl provided and no default relayUrl found for network'
    );
  }

  const relayUrlWithPath = relayUrl + AUTH_CLAIM_PATH;

  const response = await fetch(relayUrlWithPath, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'api-key': params.relayApiKey
        ? params.relayApiKey
        : '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
      'Content-Type': 'application/json',
    },
  });

  if (response.status < 200 || response.status >= 400) {
    const errResp = (await response.json()) ?? '';
    const errStmt = `An error occurred requesting "/auth/claim" endpoint ${JSON.stringify(
      errResp
    )}`;
    console.warn(errStmt);
    throw new NetworkError(
      {
        info: {
          response,
          errResp,
        },
      },
      `An error occurred requesting "/auth/claim" endpoint`
    );
  }

  const body = await response.json();
  return body.requestId;
};
