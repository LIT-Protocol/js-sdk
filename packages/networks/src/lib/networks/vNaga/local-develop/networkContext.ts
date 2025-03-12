import { createWalletClient, http } from "viem";
import {
  anvilConfig,
  anvilFirstPrivateKey,
  anvilRpcUrl,
} from "../../shared/chains/anvil";
import { NetworkContext } from "../../shared/types";
import { signatures as localDevelopSignatures } from "./naga-develop-signatures/naga-develop";
import { privateKeyToAccount } from "viem/accounts";

export const nagaLocalDevelopNetworkContext: NetworkContext<
  typeof localDevelopSignatures
> = {
  network: "custom",
  rpcUrl: anvilRpcUrl,
  privateKey: anvilFirstPrivateKey,
  chainConfig: {
    chain: anvilConfig,
    contractData: localDevelopSignatures,
  },
  httpProtocol: "http://",
  walletClient: createWalletClient({
    chain: anvilConfig,
    transport: http(anvilRpcUrl),
    account: privateKeyToAccount(anvilFirstPrivateKey),
  }),
  realmId: 1n,
};

export type NagaLocalDevelopNetworkContext =
  typeof nagaLocalDevelopNetworkContext;

// network object calls the chain client
// LitClient could use the network to figure out
