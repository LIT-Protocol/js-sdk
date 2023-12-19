import { fail, testThis } from '../../tools/scripts/utils.mjs';
import path from 'path';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export async function main() {
  // ==================== Test Logic ====================

  const contractContext = {
    AllowList: {
      address: "0xC52b72E2AD3dC58B7d23197575fb48A4523fa734"
    },
    LITToken: {
      address: "0x53695556f8a1a064EdFf91767f15652BbfaFaD04",
    },
    PubkeyRouter: {
      address: "0xF6b0fE0d0C27C855f7f2e021fAd028af02cC52cb"
    },
    MultiSender: {
      address: "0xBd119B72B52d58A7dDd771A2E4984d106Da0D1DB"
    },
    PKPHelper: {
      address: "0x24d646b9510e56af8B15de759331d897C4d66044"
    },
    PKPNFT: {
      address: "0x3c3ad2d238757Ea4AF87A8624c716B11455c1F9A"
    },
    PKPNFTMetadata: {
      address: "0xa87fe043AD341A1Dc8c5E48d75BA9f712256fe7e"
    },
    RateLimitNFT: {
      address: "0x9b1B8aD8A4144Be9F8Fb5C4766eE37CE0754AEAb"
    },
    Staking: {
      address: "0xBC7F8d7864002b6629Ab49781D5199C8dD1DDcE1"
    },
    StakingBalances: {
      address: "0x82F0a170CEDFAaab623513EE558DB19f5D787C8D"
    }
  }
  const litNodeClient = new LitNodeClient({
    // litNetwork: 'cayenne',
    litNetwork: 'custom',
    bootstrapUrls: [],
    debug: globalThis.LitCI.debug,
    contractContext: contractContext
  });
  await litNodeClient.connect();
  if (litNodeClient.config.bootstrapUrls.length > 1) {
    fail("Should have more than 0 urls bootstrapped");
  }
}

await testThis({ name: path.basename(import.meta.url), fn: main });