import { DefaultNetworkConfig } from '../../../../interfaces/NetworkContext';
import { ExpectedAccountOrWalletClient } from '../../../contract-manager/createContractsManager';
import { PKPData } from '../../../schemas/shared/PKPDataSchema';
import { mintNext } from '../../rawContractApis/pkp/write/mintNext';
import { LitTxRes } from '../../types';

export const mintWithEoa = async (
  request: any,
  networkConfig: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxRes<PKPData>> => {
  const tx = await mintNext(request, networkConfig, accountOrWalletClient);

  return tx;
};
