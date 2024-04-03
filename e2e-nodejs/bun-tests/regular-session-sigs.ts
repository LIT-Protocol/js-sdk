import { devEnv } from "./setup/env-setup";

const {
  litNodeClient,
  contractsClient,
  hotWalletAuthSig,
  hotWalletAuthMethod,
  hotWalletOwnedPkp
} = await devEnv();

process.exit();