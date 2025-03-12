import { beforeAll, describe, expect, test } from "bun:test";
import { mintNextAndAddAuthMethods } from "./mintNextAndAddAuthMethods";
import { NetworkContext, networkContext } from "../../../../_config";

describe("LitChainClient", () => {
  let networkCtx: NetworkContext;

  beforeAll(async () => {
    networkCtx = networkContext;
  });

  test("mintNextAndAddAuthMethods", async () => {
    const tx = await mintNextAndAddAuthMethods(
      {
        keyType: 2,
        permittedAuthMethodTypes: [2],
        permittedAuthMethodIds: [
          "170d13600caea2933912f39a0334eca3d22e472be203f937c4bad0213d92ed71",
        ],
        permittedAuthMethodPubkeys: ["0x"],
        permittedAuthMethodScopes: [[1]],
        addPkpEthAddressAsPermittedAddress: true,
        sendPkpToItself: true,
      },
      networkCtx
    );

    console.log(tx);

    expect(tx.receipt.logs.length).toBeGreaterThan(0);
    expect(tx.hash).toBeDefined();
    expect(tx.decodedLogs.length).toBeGreaterThan(0);
    expect(tx.data.tokenId).toBeDefined();
    expect(tx.data.pubkey).toStartWith("0x");
    expect(tx.data.ethAddress).toStartWith("0x");
  });
});
