import {
  HandshakeWithSgx,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  JsonSigningStoreRequest,
  NodeCommandResponse,
  NodeCommandServerKeysResponse,
  SendNodeCommand,
  SignWithECDSA,
  SingConditionECDSA,
  version,
} from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { Class } from './mixin';

export function NodeAPIsMixin<Base extends Class>(base: Base) {
  return class extends base {
    // ==================== SENDING COMMAND ====================
    /**
     *
     * Send a command to nodes
     *
     * @param { SendNodeCommand }
     *
     * @returns { Promise<any> }
     *
     */
    sendCommandToNode = async ({
      url,
      data,
    }: SendNodeCommand): Promise<any> => {
      log(`sendCommandToNode with url ${url} and data`, data);

      const req: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'lit-js-sdk-version': version,
        },
        body: JSON.stringify(data),
      };

      return fetch(url, req).then(async (response) => {
        const isJson = response.headers
          .get('content-type')
          ?.includes('application/json');

        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          // get error message from body or default to response status
          const error = data || response.status;
          return Promise.reject(error);
        }

        return data;
      });
    };

    // ==================== API Calls to Nodes ====================
    /**
     *
     * Get JS Execution Shares from Nodes
     *
     * @param { JsonExecutionRequest } params
     *
     * @returns { Promise<any> }
     */
    getJsExecutionShares = async (
      url: string,
      params: JsonExecutionRequest
    ): Promise<NodeCommandResponse> => {
      const { code, ipfsId, authSig, jsParams, sessionSigs } = params;

      log('getJsExecutionShares');

      // -- execute
      const urlWithPath = `${url}/web/execute`;

      const data: JsonExecutionRequest = {
        code,
        ipfsId,
        authSig,
        jsParams,
      };

      return await this.sendCommandToNode({ url: urlWithPath, data });
    };

    /**
     *
     * Get Chain Data Signing Shares
     *
     * @param { string } url
     * @param { JsonSignChainDataRequest } params
     *
     * @returns { Promise<any> }
     *
     */
    getChainDataSigningShare = async (
      url: string,
      params: JsonSignChainDataRequest
    ): Promise<NodeCommandResponse> => {
      const { callRequests, chain, iat, exp } = params;

      log('getChainDataSigningShare');

      const urlWithPath = `${url}/web/signing/sign_chain_data`;

      const data: JsonSignChainDataRequest = {
        callRequests,
        chain,
        iat,
        exp,
      };

      return await this.sendCommandToNode({ url: urlWithPath, data });
    };

    /**
     *
     * Get Signing Shares from Nodes
     *
     * @param { string } url
     * @param { JsonSigningRetrieveRequest } params
     *
     * @returns { Promise<any>}
     *
     */
    getSigningShare = async (
      url: string,
      params: JsonSigningRetrieveRequest
    ): Promise<NodeCommandResponse> => {
      log('getSigningShare');
      const urlWithPath = `${url}/web/signing/retrieve`;

      return await this.sendCommandToNode({
        url: urlWithPath,
        data: params,
      });
    };

    /**
     *
     * Ger Decryption Shares from Nodes
     *
     * @param { string } url
     * @param { JsonEncryptionRetrieveRequest } params
     *
     * @returns { Promise<any> }
     *
     */
    getDecryptionShare = async (
      url: string,
      params: JsonEncryptionRetrieveRequest
    ): Promise<NodeCommandResponse> => {
      log('getDecryptionShare');
      const urlWithPath = `${url}/web/encryption/retrieve`;

      return await this.sendCommandToNode({
        url: urlWithPath,
        data: params,
      });
    };

    /**
     *
     * Store signing conditions to nodes
     *
     * @param { string } url
     * @param { JsonSigningStoreRequest } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    storeSigningConditionWithNode = async (
      url: string,
      params: JsonSigningStoreRequest
    ): Promise<NodeCommandResponse> => {
      log('storeSigningConditionWithNode');

      const urlWithPath = `${url}/web/signing/store`;

      return await this.sendCommandToNode({
        url: urlWithPath,
        data: {
          key: params.key,
          val: params.val,
          authSig: params.authSig,
          chain: params.chain,
          permanant: params.permanent,
        },
      });
    };

    /**
     *
     * Store encryption conditions to nodes
     *
     * @param { string } urk
     * @param { JsonEncryptionStoreRequest } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    storeEncryptionConditionWithNode = async (
      url: string,
      params: JsonSigningStoreRequest
    ): Promise<NodeCommandResponse> => {
      log('storeEncryptionConditionWithNode');
      const urlWithPath = `${url}/web/encryption/store`;
      const data = {
        key: params.key,
        val: params.val,
        authSig: params.authSig,
        chain: params.chain,
        permanant: params.permanent,
      };

      return await this.sendCommandToNode({ url: urlWithPath, data });
    };

    /**
     *
     * Sign wit ECDSA
     *
     * @param { string } url
     * @param { SignWithECDSA } params
     *
     * @returns { Promise}
     *
     */
    signECDSA = async (
      url: string,
      params: SignWithECDSA
    ): Promise<NodeCommandResponse> => {
      console.log('sign_message_ecdsa');

      const urlWithPath = `${url}/web/signing/sign_message_ecdsa`;

      return await this.sendCommandToNode({
        url: urlWithPath,
        data: params,
      });
    };

    /**
     *
     * Sign Condition ECDSA
     *
     * @param { string } url
     * @param { SignConditionECDSA } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    signConditionEcdsa = async (
      url: string,
      params: SingConditionECDSA
    ): Promise<NodeCommandResponse> => {
      log('signConditionEcdsa');
      const urlWithPath = `${url}/web/signing/signConditionEcdsa`;

      const data = {
        access_control_conditions: params.accessControlConditions,
        evmContractConditions: params.evmContractConditions,
        solRpcConditions: params.solRpcConditions,
        auth_sig: params.auth_sig,
        chain: params.chain,
        iat: params.iat,
        exp: params.exp,
      };

      return await this.sendCommandToNode({
        url: urlWithPath,
        data,
      });
    };

    /**
     *
     * Handshake with SGX
     *
     * @param { HandshakeWithSgx } params
     *
     * @returns { Promise<NodeCommandServerKeysResponse> }
     *
     */
    handshakeWithSgx = async (
      params: HandshakeWithSgx
    ): Promise<NodeCommandServerKeysResponse> => {
      // -- get properties from params
      const { url } = params;

      // -- create url with path
      const urlWithPath = `${url}/web/handshake`;

      log(`handshakeWithSgx ${urlWithPath}`);

      const data = {
        clientPublicKey: 'test',
      };

      return await this.sendCommandToNode({
        url: urlWithPath,
        data,
      });
    };
  };
}
