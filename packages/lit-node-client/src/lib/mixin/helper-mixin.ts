import {
  checkAndSignAuthMessage,
  parseResource,
} from '@lit-protocol/auth-browser';
import {
  ExecuteJsProps,
  JsonAuthSig,
  JsonExecutionRequest,
  LIT_ERROR,
  LOCAL_STORAGE_KEYS,
  SessionKeyPair,
} from '@lit-protocol/constants';
import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { convertLitActionsParams, log, throwError } from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';
import { SiweMessage } from 'lit-siwe';
import { Class } from './mixin';

export function HelperMixin<Base extends Class>(base: Base) {
  return class extends base {
    /**
     *
     * Get either auth sig or session auth sig
     *
     */
    getAuthSigOrSessionAuthSig = ({
      authSig,
      sessionSigs,
      url,
    }: {
      authSig: JsonAuthSig | any;
      sessionSigs: any;
      url: string;
    }) => {
      // -- if there's session
      let sigToPassToNode = authSig;

      if (sessionSigs) {
        sigToPassToNode = sessionSigs[url];

        if (!sigToPassToNode) {
          throwError({
            message: `You passed sessionSigs but we could not find session sig for node ${url}`,
            error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
          });
        }
      }
      return sigToPassToNode;
    };

    /**
     *
     * Get the request body of the lit action
     *
     * @param { ExecuteJsProps } params
     *
     * @returns { JsonExecutionRequest }
     *
     */
    getLitActionRequestBody = (
      params: ExecuteJsProps
    ): JsonExecutionRequest => {
      const reqBody: JsonExecutionRequest = {
        authSig: params.authSig,
        jsParams: convertLitActionsParams(params.jsParams),
      };

      if (params.code) {
        const _uint8Array = uint8arrayFromString(params.code, 'utf8');
        const encodedJs = uint8arrayToString(_uint8Array, 'base64');

        reqBody.code = encodedJs;
      }

      if (params.ipfsId) {
        reqBody.ipfsId = params.ipfsId;
      }

      return reqBody;
    };

    /**
     *
     * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
     *
     */
    getJWTParams = () => {
      const now = Date.now();
      const iat = Math.floor(now / 1000);
      const exp = iat + 12 * 60 * 60; // 12 hours in seconds

      return { iat, exp };
    };

    /**
     *
     * Parse the response string to JSON
     *
     * @param { string } responseString
     *
     * @returns { any } JSON object
     *
     */
    parseResponses = (responseString: string): any => {
      let response: any;

      try {
        response = JSON.parse(responseString);
      } catch (e) {
        log(
          'Error parsing response as json.  Swallowing and returning as string.',
          responseString
        );
      }

      return response;
    };

    // ==================== SESSIONS ====================
    /**
     *
     * Try to get the session key in the local storage,
     * if not, generates one.
     * @param { string } supposedSessionKey
     * @return { }
     */
    getSessionKey = (supposedSessionKey?: string): SessionKeyPair => {
      let sessionKey: any = supposedSessionKey ?? '';

      const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY;
      const storedSessionKeyOrError = getStorageItem(storageKey);

      if (sessionKey === '') {
        // check if we already have a session key + signature for this chain
        // let storedSessionKey;
        let storedSessionKey: any;

        // -- (TRY) to get it in the local storage
        if (storedSessionKeyOrError.type === 'ERROR') {
          console.warn(
            `Storage key "${storageKey}" is missing. Not a problem. Contiune...`
          );
        } else {
          storedSessionKey = storedSessionKeyOrError.result;
        }

        // -- IF NOT: Generates one
        if (!storedSessionKey || storedSessionKey == '') {
          sessionKey = generateSessionKeyPair();

          // (TRY) to set to local storage
          try {
            localStorage.setItem(storageKey, JSON.stringify(sessionKey));
          } catch (e) {
            console.warn(
              `Localstorage not available. Not a problem. Contiune...`
            );
          }
        } else {
          console.log('storedSessionKeyOrError');
          sessionKey = JSON.parse(storedSessionKeyOrError.result);
        }
      }

      return sessionKey as SessionKeyPair;
    };

    /**
     *
     * Get session capabilities from user, it not, generates one
     * @param { Array<any> } capabilities
     * @param { Array<any> } resources
     * @return { Array<any> }
     */
    getSessionCapabilities = (
      capabilities: Array<any>,
      resources: Array<any>
    ): Array<any> => {
      if (!capabilities || capabilities.length == 0) {
        capabilities = resources.map((resource: any) => {
          const { protocol, resourceId } = parseResource({ resource });

          return `${protocol}Capability://*`;
        });
      }

      return capabilities;
    };

    /**
     *
     * Get expiration for session
     *
     */
    getExpiration = () => {
      return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    };

    /**
     *
     * Get the signature from local storage, if not, generates one
     *
     */
    getWalletSig = async ({
      authNeededCallback,
      chain,
      capabilities,
      switchChain,
      expiration,
      sessionKeyUri,
    }: {
      authNeededCallback: any;
      chain: string;
      capabilities: Array<any>;
      switchChain: boolean;
      expiration: string;
      sessionKeyUri: string;
    }): Promise<JsonAuthSig> => {
      let walletSig;

      const storageKey = LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;
      const storedWalletSigOrError = getStorageItem(storageKey);

      // -- (TRY) to get it in the local storage
      if (storedWalletSigOrError.type === 'ERROR') {
        console.warn(
          `Storage key "${storageKey}" is missing. Not a problem. Contiune...`
        );
      } else {
        walletSig = storedWalletSigOrError.result;
      }

      // -- IF NOT: Generates one
      if (
        !storedWalletSigOrError.result ||
        storedWalletSigOrError.result == ''
      ) {
        if (authNeededCallback) {
          walletSig = await authNeededCallback({
            chain,
            resources: capabilities,
            switchChain,
            expiration,
            uri: sessionKeyUri,
          });
        } else {
          walletSig = await checkAndSignAuthMessage({
            chain,
            resources: capabilities,
            switchChain,
            expiration,
            uri: sessionKeyUri,
          });
        }
      } else {
        try {
          walletSig = JSON.parse(storedWalletSigOrError.result);
        } catch (e) {
          console.warn('Error parsing walletSig', e);
        }
      }

      return walletSig;
    };

    /**
     *
     * Check if a session key needs to be resigned
     *
     */
    checkNeedToResignSessionKey = async ({
      siweMessage,
      walletSignature,
      sessionKeyUri,
      resources,
      sessionCapabilities,
    }: {
      siweMessage: SiweMessage;
      walletSignature: any;
      sessionKeyUri: any;
      resources: any;
      sessionCapabilities: Array<any>;
    }): Promise<boolean> => {
      let needToResign = false;

      try {
        // @ts-ignore
        await siweMessage.verify({ signature: walletSignature });
      } catch (e) {
        needToResign = true;
      }

      // make sure the sig is for the correct session key
      if (siweMessage.uri !== sessionKeyUri) {
        needToResign = true;
      }

      // make sure the sig has the session capabilities required to fulfill the resources requested
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const { protocol, resourceId } = parseResource({ resource });

        // check if we have blanket permissions or if we authed the specific resource for the protocol
        const permissionsFound = sessionCapabilities.some((capability: any) => {
          const capabilityParts = parseResource({ resource: capability });
          return (
            capabilityParts.protocol === protocol &&
            (capabilityParts.resourceId === '*' ||
              capabilityParts.resourceId === resourceId)
          );
        });
        if (!permissionsFound) {
          needToResign = true;
        }
      }

      return needToResign;
    };
  };
}
