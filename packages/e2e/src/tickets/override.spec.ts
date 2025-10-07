describe('rpc override', () => {
  const TEST_RPC = process.env.LIT_YELLOWSTONE_PRIVATE_RPC_URL;
  // const TEST_RPC = 'https://yellowstone-override.example';

  // beforeAll(() => {
  //   process.env.LIT_YELLOWSTONE_PRIVATE_RPC_URL = TEST_RPC;
  // });

  // afterAll(() => {
  //   process.env.LIT_YELLOWSTONE_PRIVATE_RPC_URL = ORIGINAL_RPC;
  // });

  it('applies env rpc override to module and client', async () => {
    const networks = await import('@lit-protocol/networks');

    // choose module by NETWORK env (same way init.ts does)
    const network = process.env.NETWORK || 'naga-dev';
    const importNameMap: Record<string, string> = {
      'naga-dev': 'nagaDev',
      'naga-test': 'nagaTest',
      'naga-local': 'nagaLocal',
      'naga-staging': 'nagaStaging',
    };
    const importName = importNameMap[network];
    const baseModule: any = (networks as any)[importName];

    // apply override
    const mod =
      typeof baseModule.withOverrides === 'function'
        ? baseModule.withOverrides({ rpcUrl: TEST_RPC })
        : baseModule;

    // log for verification
    // base vs effective (when override is supported)
    const baseRpcUrl =
      typeof baseModule.getRpcUrl === 'function'
        ? baseModule.getRpcUrl()
        : 'n/a';
    const effRpcUrl =
      typeof mod.getRpcUrl === 'function' ? mod.getRpcUrl() : 'n/a';
    // eslint-disable-next-line no-console
    console.log('[rpc-override] TEST_RPC:', TEST_RPC);
    // eslint-disable-next-line no-console
    console.log(
      '[rpc-override] module rpc (base → effective):',
      baseRpcUrl,
      '→',
      effRpcUrl
    );
    try {
      const baseChain =
        typeof baseModule.getChainConfig === 'function'
          ? baseModule.getChainConfig()
          : null;
      const effChain =
        typeof mod.getChainConfig === 'function' ? mod.getChainConfig() : null;
      if (baseChain && effChain) {
        // eslint-disable-next-line no-console
        console.log(
          '[rpc-override] module chain id/name (base → effective):',
          `${baseChain.id}/${baseChain.name}`,
          '→',
          `${effChain.id}/${effChain.name}`
        );
        // eslint-disable-next-line no-console
        console.log(
          '[rpc-override] module rpcUrls.default.http (base → effective):',
          baseChain.rpcUrls.default.http,
          '→',
          effChain.rpcUrls.default.http
        );
        // eslint-disable-next-line no-console
        console.log(
          '[rpc-override] module rpcUrls.public.http (base → effective):',
          (baseChain.rpcUrls as any)['public']?.http,
          '→',
          (effChain.rpcUrls as any)['public']?.http
        );
      }
    } catch {}

    // module reflects override
    expect(mod.getRpcUrl()).toBe(TEST_RPC);
    const chain = mod.getChainConfig();
    expect(chain.rpcUrls.default.http[0]).toBe(TEST_RPC);
    expect((chain.rpcUrls as any)['public'].http[0]).toBe(TEST_RPC);

    // client reflects override
    const { createLitClient } = await import('@lit-protocol/lit-client');
    const client = await createLitClient({ network: mod });
    const cc = client.getChainConfig();

    // eslint-disable-next-line no-console
    console.log('[rpc-override] client rpcUrl:', cc.rpcUrl);
    // eslint-disable-next-line no-console
    console.log(
      '[rpc-override] client viem rpcUrls.default:',
      cc.viemConfig.rpcUrls.default.http
    );
    // eslint-disable-next-line no-console
    console.log(
      '[rpc-override] client viem rpcUrls.public:',
      (cc.viemConfig.rpcUrls as any)['public']?.http
    );

    expect(cc.rpcUrl).toBe(TEST_RPC);
    expect(cc.viemConfig.rpcUrls.default.http[0]).toBe(TEST_RPC);
    expect((cc.viemConfig.rpcUrls as any)['public'].http[0]).toBe(TEST_RPC);
  });
});
