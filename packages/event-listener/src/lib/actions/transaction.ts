import { ethers } from 'ethers';

import { AutomationError } from '@lit-protocol/constants';

import { Action } from './action';
import { executeLitAction, signWithLitActionCode } from '../litActions';
import { StateMachine } from '../state-machine';
import { Address, ContextOrLiteral, PKPInfo } from '../types';
import { getEvmChain } from '../utils/chain';

function arrayfy(value: unknown) {
  return Array.isArray(value) ? value : [value];
}

interface TransactionActionBaseParams {
  debug?: boolean;
  stateMachine: StateMachine;
  evmChainId: ContextOrLiteral<number>;
  contractAddress: ContextOrLiteral<Address>;
  value?: ContextOrLiteral<string>;
}

interface TransactionActionWithoutDataParams
  extends TransactionActionBaseParams {
  contractABI: ethers.ContractInterface;
  method: ContextOrLiteral<string>;
  params?: ContextOrLiteral<unknown> | ContextOrLiteral<unknown>[];
}

interface TransactionActionWithDataParams extends TransactionActionBaseParams {
  data?: ContextOrLiteral<string>;
}

type TransactionActionParams =
  | TransactionActionWithoutDataParams
  | TransactionActionWithDataParams;

export class TransactionAction extends Action {
  constructor(params: TransactionActionParams) {
    const litActionFunction = async () => {
      const activePkp = params.stateMachine.resolveContextPathOrLiteral({
        contextPath: 'activePkp',
      }) as unknown as PKPInfo;
      if (!activePkp.ethAddress) {
        throw new AutomationError(
          {
            info: {
              machineId: params.stateMachine.id,
              activePkp,
            },
          },
          `There is no active pkp. Must configure it to run a transaction`
        );
      }

      // Resolve transaction data from context
      const txChainId = params.stateMachine.resolveContextPathOrLiteral(
        params.evmChainId
      );
      const chain = getEvmChain(txChainId);
      const chainProvider = new ethers.providers.JsonRpcProvider(
        chain.rpcUrls[0],
        chain.chainId
      );

      const txContractAddress = params.stateMachine.resolveContextPathOrLiteral(
        params.contractAddress
      );
      const txValue = params.stateMachine.resolveContextPathOrLiteral(
        params.value
      );
      // transaction can have data or the fields necessary to populate it
      let txData: ethers.BytesLike | undefined;
      if (!('contractABI' in params)) {
        txData = params.stateMachine.resolveContextPathOrLiteral(params.data);
      } else {
        const txMethod = params.stateMachine.resolveContextPathOrLiteral(
          params.method
        );
        const txParams = arrayfy(
          !Array.isArray(params.params)
            ? params.stateMachine.resolveContextPathOrLiteral(params.params)
            : params.params.map(
                params.stateMachine.resolveContextPathOrLiteral.bind(
                  params.stateMachine
                )
              )
        );

        const contract = new ethers.Contract(
          txContractAddress,
          params.contractABI,
          chainProvider
        );
        const populatedTx = await contract.populateTransaction[txMethod](
          ...txParams
        );
        txData = populatedTx.data;
      }

      const gasLimit = await chainProvider.estimateGas({
        to: txContractAddress,
        data: txData,
        from: activePkp.ethAddress,
      });
      const gasPrice = await chainProvider.getGasPrice();
      const nonce = await chainProvider.getTransactionCount(
        activePkp.ethAddress
      );

      const rawTx: ethers.UnsignedTransaction = {
        chainId: chain.chainId,
        data: txData,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
        nonce,
        to: txContractAddress,
        value: txValue,
      };
      const rawTxHash = ethers.utils.keccak256(
        ethers.utils.serializeTransaction(rawTx)
      );

      // Sign with the PKP in a LitAction
      const yellowstoneMachineSigner = params.stateMachine.signer;
      const litActionResponse = await executeLitAction({
        litNodeClient: params.stateMachine.litNodeClient,
        capacityTokenId: params.stateMachine.resolveContextPathOrLiteral({
          contextPath: 'activeCapacityTokenId',
        }) as unknown as string,
        pkpEthAddress: activePkp.ethAddress,
        pkpPublicKey: activePkp.publicKey,
        authSigner: yellowstoneMachineSigner,
        code: signWithLitActionCode,
        jsParams: {
          toSign: ethers.utils.arrayify(rawTxHash),
          publicKey: activePkp.publicKey,
          sigName: 'signedTransaction',
        },
      });
      if (!litActionResponse.success) {
        throw new AutomationError(
          {
            info: {
              machineId: params.stateMachine.id,
              evmChainId: params.evmChainId,
              contractAddress: params.contractAddress,
              value: params.value,
              data: 'data' in params ? params.data : undefined,
              contractABI:
                'contractABI' in params ? params.contractABI : undefined,
              method: 'method' in params ? params.method : undefined,
              params: 'params' in params ? params.params : undefined,
              logs: litActionResponse.logs,
            },
          },
          `Failed to sign transaction`
        );
      }

      const signature = litActionResponse.response as string;
      const jsonSignature = JSON.parse(signature);
      jsonSignature.r = '0x' + jsonSignature.r.substring(2);
      jsonSignature.s = '0x' + jsonSignature.s;
      const hexSignature = ethers.utils.joinSignature(jsonSignature);

      const signedTx = ethers.utils.serializeTransaction(rawTx, hexSignature);

      const receipt = await chainProvider.sendTransaction(signedTx);

      // TODO send user this result with a webhook and log
      params.stateMachine.setToContext('lastTransactionReceipt', receipt);
    };

    super({
      debug: params.debug,
      function: litActionFunction,
    });
  }
}
