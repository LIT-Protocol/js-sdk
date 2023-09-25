import { LIT_ERROR } from '@lit-protocol/constants';

import {
  AccsCOSMOSParams,
  AccsDefaultParams,
  AccsEVMParams,
  AccsRegularParams,
  AccsSOLV2Params,
  HumanizedAccsProps,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

import { decimalPlaces, log, throwError } from '@lit-protocol/misc';
import { formatEther, formatUnits } from 'ethers/lib/utils';

/**
 *
 * Format SOL number using Ether Units
 *
 * @param { number } amount
 *
 * @returns { string } formatted unit
 *
 */
export const formatSol = (amount: number): string => {
  return formatUnits(amount, 9);
};

/**
 *
 * Format Atom number using Ether Units
 *
 * @param { number } amount
 *
 * @returns { string } formatted unit
 *
 */
export const formatAtom = (amount: number): string => {
  return formatUnits(amount, 6);
};

/**
 *
 * Comparator translator
 *
 * @param { string } comparator
 *
 * @returns { string } humanized version of the comparator
 */
export const humanizeComparator = (comparator: string): string | undefined => {
  let list: any = {
    '>': 'more than',
    '>=': 'at least',
    '=': 'exactly',
    '<': 'less than',
    '<=': 'at most',
    contains: 'contains',
  };

  let selected: string | undefined = list[comparator];

  if (!selected) {
    log(`Unregonized comparator ${comparator}`);
    return;
  }

  return selected;
};

/**
 *
 * Humanize EVM basic access control conditions
 *
 * @property { Array<AccsRegularParams | AccsDefaultParams | any> } accessControlConditions
 * @property { Array<any | string> } tokenList
 * @property { string } myWalletAddress
 *
 * @returns
 */
export const humanizeEvmBasicAccessControlConditions = async ({
  accessControlConditions,
  tokenList,
  myWalletAddress,
}: {
  accessControlConditions: Array<AccsRegularParams | AccsDefaultParams | any>;
  tokenList?: Array<any | string>;
  myWalletAddress?: string;
}): Promise<string> => {

  log('humanizing evm basic access control conditions');
  log('myWalletAddress', myWalletAddress);
  log('accessControlConditions', accessControlConditions);

  let fixedConditions: any = accessControlConditions;

  // inject and operator if needed
  // this is done because before we supported operators,
  // we let users specify an entire array of conditions
  // that would be "AND"ed together.  this injects those ANDs
  if (accessControlConditions.length > 1) {
    let containsOperator = false;

    for (let i = 0; i < accessControlConditions.length; i++) {
      if (accessControlConditions[i].operator) {
        containsOperator = true;
      }
    }

    if (!containsOperator) {
      fixedConditions = [];

      // insert ANDs between conditions
      for (let i = 0; i < accessControlConditions.length; i++) {
        fixedConditions.push(accessControlConditions[i]);
        if (i < accessControlConditions.length - 1) {
          fixedConditions.push({
            operator: 'and',
          });
        }
      }
    }
  }


  // -- execute
  const promises = await Promise.all(
    fixedConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeEvmBasicAccessControlConditions({
          accessControlConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === 'and') {
          return ' and ';
        } else if (acc.operator.toLowerCase() === 'or') {
          return ' or ';
        }
      }

      if (
        acc.standardContractType === 'timestamp' &&
        acc.method === 'eth_getBlockByNumber'
      ) {
        return `Latest mined block must be past the unix timestamp ${acc.returnValueTest.value}`;
      }

      else if (
        acc.standardContractType === 'MolochDAOv2.1' &&
        acc.method === 'members'
      ) {
        // molochDAOv2.1 membership
        return `Is a member of the DAO at ${acc.contractAddress}`;
      }

      else if (
        acc.standardContractType === 'ERC1155' &&
        acc.method === 'balanceOf'
      ) {
        // erc1155 owns an amount of specific tokens
        return `Owns ${humanizeComparator(acc.returnValueTest.comparator)} ${acc.returnValueTest.value
          } of ${acc.contractAddress} tokens with token id ${acc.parameters[1]}`;
      }

      else if (
        acc.standardContractType === 'ERC1155' &&
        acc.method === 'balanceOfBatch'
      ) {
        // erc1155 owns an amount of specific tokens from a batch of token ids
        return `Owns ${humanizeComparator(acc.returnValueTest.comparator)} ${acc.returnValueTest.value
          } of ${acc.contractAddress} tokens with token id ${acc.parameters[1]
            .split(',')
            .join(' or ')}`;
      }

      else if (
        acc.standardContractType === 'ERC721' &&
        acc.method === 'ownerOf'
      ) {
        // specific erc721
        return `Owner of tokenId ${acc.parameters[0]} from ${acc.contractAddress}`;
      }

      else if (
        acc.standardContractType === 'ERC721' &&
        acc.method === 'balanceOf' &&
        acc.contractAddress === '0x22C1f6050E56d2876009903609a2cC3fEf83B415' &&
        acc.returnValueTest.comparator === '>' &&
        acc.returnValueTest.value === '0'
      ) {
        // for POAP main contract where the user owns at least 1 poap
        return `Owns any POAP`;
      }

      else if (
        acc.standardContractType === 'POAP' &&
        acc.method === 'tokenURI'
      ) {
        // owns a POAP
        return `Owner of a ${acc.returnValueTest.value} POAP on ${acc.chain}`;
      }

      else if (
        acc.standardContractType === 'POAP' &&
        acc.method === 'eventId'
      ) {
        // owns a POAP
        return `Owner of a POAP from event ID ${acc.returnValueTest.value} on ${acc.chain}`;
      }

      else if (
        acc.standardContractType === 'CASK' &&
        acc.method === 'getActiveSubscriptionCount'
      ) {
        // Cask powered subscription
        return `Cask subscriber to provider ${acc.parameters[1]} for plan ${acc.parameters[2]} on ${acc.chain}`;
      }

      else if (
        acc.standardContractType === 'ERC721' &&
        acc.method === 'balanceOf'
      ) {
        // any erc721 in collection
        return `Owns ${humanizeComparator(acc.returnValueTest.comparator)} ${acc.returnValueTest.value
          } of ${acc.contractAddress} tokens`;
      }

      else if (
        acc.standardContractType === 'ERC20' &&
        acc.method === 'balanceOf'
      ) {
        let tokenFromList;
        if (tokenList) {
          tokenFromList = tokenList.find(
            (t: any) => t.address === acc.contractAddress
          );
        }
        let decimals, name;
        if (tokenFromList) {
          decimals = tokenFromList.decimals;
          name = tokenFromList.symbol;
        } else {
          try {
            decimals = await decimalPlaces({
              contractAddress: acc.contractAddress,
              chain: acc.chain,
            });
          } catch (e) {
            console.log(`Failed to get decimals for ${acc.contractAddress}`);
          }
        }
        log('decimals', decimals);
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatUnits(acc.returnValueTest.value, decimals)} of ${name || acc.contractAddress
          } tokens`;
      }

      else if (
        acc.standardContractType === '' &&
        acc.method === 'eth_getBalance'
      ) {
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatEther(acc.returnValueTest.value)} ETH`;
      }

      else if (acc.standardContractType === '' && acc.method === '') {
        if (
          myWalletAddress &&
          acc.returnValueTest.value.toLowerCase() ===
          myWalletAddress.toLowerCase()
        ) {
          return `Controls your wallet (${myWalletAddress})`;
        } else {
          return `Controls wallet with address ${acc.returnValueTest.value}`;
        }
      }

      return 'Oops. something went wrong!';
    })
  );
  return promises.join('');
};

/**
 *
 * Humanize EVM contract conditions
 *
 * @property { Array<AccsEVMParams> } evmContractConditions
 * @property { Array<any | string> } tokenList
 * @property { string } myWalletAddress
 *
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 *
 */
export const humanizeEvmContractConditions = async ({
  evmContractConditions,
  tokenList,
  myWalletAddress,
}: {
  evmContractConditions: Array<AccsEVMParams>;
  tokenList?: Array<any | string>;
  myWalletAddress?: string;
}): Promise<string> => {
  log('humanizing evm contract conditions');
  log('myWalletAddress', myWalletAddress);
  log('evmContractConditions', evmContractConditions);

  const promises = await Promise.all(
    evmContractConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeEvmContractConditions({
          evmContractConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === 'and') {
          return ' and ';
        } else if (acc.operator.toLowerCase() === 'or') {
          return ' or ';
        }
      }

      let msg = `${acc.functionName}(${acc.functionParams.join(
        ', '
      )}) on contract address ${acc.contractAddress
        } should have a result of ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${acc.returnValueTest.value}`;
      if (acc.returnValueTest.key !== '') {
        msg += ` for key ${acc.returnValueTest.key}`;
      }
      return msg;
    })
  );

  return promises.join('');
};

/**
 *
 * Humanize SOL RPC Conditions
 *
 * @property { Array<AccsSOLV2Params> } solRpcConditions
 * @property { Array<any | string> } tokenList
 * @property { string } myWalletAddress
 *
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 *
 */
export const humanizeSolRpcConditions = async ({
  solRpcConditions,
  tokenList,
  myWalletAddress,
}: {
  solRpcConditions: Array<AccsSOLV2Params>;
  tokenList?: Array<any | string>;
  myWalletAddress?: string;
}): Promise<string> => {
  log('humanizing sol rpc conditions');
  log('myWalletAddress', myWalletAddress);
  log('solRpcConditions', solRpcConditions);

  const promises = await Promise.all(
    solRpcConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeSolRpcConditions({
          solRpcConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === 'and') {
          return ' and ';
        } else if (acc.operator.toLowerCase() === 'or') {
          return ' or ';
        }
      }

      if (acc.method === 'getBalance') {
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatSol(acc.returnValueTest.value)} SOL`;
      } else if (acc.method === '') {
        if (
          myWalletAddress &&
          acc.returnValueTest.value.toLowerCase() ===
          myWalletAddress.toLowerCase()
        ) {
          return `Controls your wallet (${myWalletAddress})`;
        } else {
          return `Controls wallet with address ${acc.returnValueTest.value}`;
        }
      } else {
        let msg = `Solana RPC method ${acc.method}(${acc.params.join(
          ', '
        )}) should have a result of ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${acc.returnValueTest.value}`;
        if (acc.returnValueTest.key !== '') {
          msg += ` for key ${acc.returnValueTest.key}`;
        }
        return msg;
      }
    })
  );
  return promises.join('');
};

/**
 *
 * Humanize Cosmos Conditions
 *
 * @property { Array<AccsCOSMOSParams> } cosmosConditions
 * @property { Array<any | string> } tokenList
 * @property { string } myWalletAddress
 *
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 *
 */
export const humanizeCosmosConditions = async ({
  cosmosConditions,
  tokenList,
  myWalletAddress,
}: {
  cosmosConditions: Array<AccsCOSMOSParams | any>;
  tokenList?: Array<any | string>;
  myWalletAddress?: string;
}): Promise<string> => {
  log('humanizing cosmos conditions');
  log('myWalletAddress', myWalletAddress);
  log('cosmosConditions', cosmosConditions);

  const promises = await Promise.all(
    cosmosConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeCosmosConditions({
          cosmosConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === 'and') {
          return ' and ';
        } else if (acc.operator.toLowerCase() === 'or') {
          return ' or ';
        }
      }

      if (acc.path === '/cosmos/bank/v1beta1/balances/:userAddress') {
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatAtom(acc.returnValueTest.value)} ATOM`;
      } else if (acc.path === ':userAddress') {
        if (
          myWalletAddress &&
          acc.returnValueTest.value.toLowerCase() ===
          myWalletAddress.toLowerCase()
        ) {
          return `Controls your wallet (${myWalletAddress})`;
        } else {
          return `Controls wallet with address ${acc.returnValueTest.value}`;
        }
      } else if (
        acc.chain === 'kyve' &&
        acc.path === '/kyve/registry/v1beta1/funders_list/0'
      ) {
        return `Is a current KYVE funder`;
      } else {
        let msg = `Cosmos RPC request for ${acc.path
          } should have a result of ${humanizeComparator(
            acc.returnValueTest.comparator
          )} ${acc.returnValueTest.value}`;
        if (acc.returnValueTest.key !== '') {
          msg += ` for key ${acc.returnValueTest.key}`;
        }
        return msg;
      }
    })
  );
  return promises.join('');
};

/**
 *
 * Humanize unified access control conditions
 *
 * @property { Array<AccsRegularParams | AccsDefaultParams | AccsSOLV2Params | AccsEVMParams | AccsCOSMOSParams> } unifiedAccessControlConditions
 * @property { Array<any | string> } tokenList
 * @property { string } myWalletAddress
 *
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 */
export const humanizeUnifiedAccessControlConditions = async ({
  unifiedAccessControlConditions,
  tokenList,
  myWalletAddress,
}: {
  unifiedAccessControlConditions: UnifiedAccessControlConditions;
  tokenList?: Array<any | string>;
  myWalletAddress?: string;
}): Promise<string> => {


  const promises = await Promise.all(
    unifiedAccessControlConditions.map(async (acc: any): Promise<any> => {

      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeUnifiedAccessControlConditions({
          unifiedAccessControlConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === 'and') {
          return ' and ';
        } else if (acc.operator.toLowerCase() === 'or') {
          return ' or ';
        }
      }

      if (acc.conditionType === 'evmBasic') {
        return humanizeEvmBasicAccessControlConditions({
          accessControlConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else if (acc.conditionType === 'evmContract') {
        return humanizeEvmContractConditions({
          evmContractConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else if (acc.conditionType === 'solRpc') {
        return humanizeSolRpcConditions({
          solRpcConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else if (acc.conditionType === 'cosmos') {
        return humanizeCosmosConditions({
          cosmosConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else {
        throwError({
          message: `Unrecognized condition type: ${acc.conditionType}`,
          errorKind: LIT_ERROR.INVALID_UNIFIED_CONDITION_TYPE.kind,
          errorCode: LIT_ERROR.INVALID_UNIFIED_CONDITION_TYPE.name,
        });
      }
    })
  );
  return promises.join('');
};

/**
 *
 * The human readable name for an access control condition
 *
 * @param { HumanizedAccsProps } params
 *
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 */
export const humanizeAccessControlConditions = async ({
  accessControlConditions,
  evmContractConditions,
  solRpcConditions,
  unifiedAccessControlConditions,
  tokenList,
  myWalletAddress,
}: HumanizedAccsProps): Promise<string | undefined> => {

  // -- check if each condition exists in linear
  if (accessControlConditions) {
    return humanizeEvmBasicAccessControlConditions({
      accessControlConditions,
      tokenList,
      myWalletAddress,
    });
  } else if (evmContractConditions) {
    return humanizeEvmContractConditions({
      evmContractConditions,
      tokenList,
      myWalletAddress,
    });
  } else if (solRpcConditions) {
    return humanizeSolRpcConditions({
      solRpcConditions,
      tokenList,
      myWalletAddress,
    });
  } else if (unifiedAccessControlConditions) {
    return humanizeUnifiedAccessControlConditions({
      unifiedAccessControlConditions,
      tokenList,
      myWalletAddress,
    });
  }

  // -- undefined
  return;
};
