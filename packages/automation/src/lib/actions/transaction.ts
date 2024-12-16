import { ethers } from 'ethers';

import { AutomationError } from '@lit-protocol/constants';

import { Action } from './action';
import { executeLitAction, signWithLitActionCode } from '../litActions';
import { StateMachine } from '../state-machine';
import { Address, ContextOrLiteral, PKPInfo } from '../types';
import { getEvmChain } from '../utils/chain';

interface TransactionActionParams {
  debug?: boolean;
  stateMachine: StateMachine;
  evmChainId: ContextOrLiteral<number>;
  contractABI: ethers.ContractInterface;
  contractAddress: ContextOrLiteral<Address>;
  method: ContextOrLiteral<string>;
  params?: ContextOrLiteral<unknown>[];
  value?: ContextOrLiteral<string>;
}

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

      const yellowstoneMachineSigner = params.stateMachine.signer;

      const chainId = params.stateMachine.resolveContextPathOrLiteral(
        params.evmChainId
      );
      const chain = getEvmChain(chainId);
      const chainProvider = new ethers.providers.JsonRpcProvider(
        chain.rpcUrls[0],
        chain.chainId
      );

      const contract = new ethers.Contract(
        params.stateMachine.resolveContextPathOrLiteral(params.contractAddress),
        params.contractABI,
        chainProvider
      );

      const txParams = (params.params || []).map(
        params.stateMachine.resolveContextPathOrLiteral.bind(
          params.stateMachine
        )
      );
      const txMethod = params.stateMachine.resolveContextPathOrLiteral(
        params.method
      );
      const txData = await contract.populateTransaction[txMethod](...txParams);
      const gasLimit = await chainProvider.estimateGas({
        to: params.stateMachine.resolveContextPathOrLiteral(
          params.contractAddress
        ),
        data: txData.data,
        from: activePkp.ethAddress,
      });
      const gasPrice = await chainProvider.getGasPrice();
      const nonce = await chainProvider.getTransactionCount(
        activePkp.ethAddress
      );

      const rawTx = {
        chainId: chain.chainId,
        data: txData.data,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
        nonce,
        to: params.stateMachine.resolveContextPathOrLiteral(
          params.contractAddress
        ),
      };
      const rawTxHash = ethers.utils.keccak256(
        ethers.utils.serializeTransaction(rawTx)
      );

      // Sign with the PKP in a LitAction
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
