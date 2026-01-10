<script>
  import { createAuthManager } from '@lit-protocol/auth';
  import { storagePlugins } from '@lit-protocol/auth/storage';
  import { createLitClient } from '@lit-protocol/lit-client';
  import { nagaDev, nagaTest } from '@lit-protocol/networks';
  import { createPublicClient, formatEther, http } from 'viem';
  import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

  const NETWORKS = {
    'naga-dev': nagaDev,
    'naga-test': nagaTest,
  };

  const DEFAULT_FAUCET_URL =
    'https://chronicle-yellowstone-faucet.getlit.dev/naga';

  let networkName = 'naga-dev';
  let authStatus = 'idle';
  let authError = null;
  let authSummary = null;
  let authContext = null;
  let account = null;

  let balanceStatus = 'idle';
  let balanceError = null;
  let nativeBalance = null;
  let ledgerBalance = null;

  let pkpStatus = 'idle';
  let pkpError = null;
  let pkpInfo = null;
  let pkps = [];
  let pkpPublicKey = '';
  let pkpMessage = 'Hello, world!';
  let pkpSignature = null;
  let faucetUrl = DEFAULT_FAUCET_URL;

  const stringify = (value) =>
    JSON.stringify(
      value,
      (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
      2
    );

  const buildFaucetLink = () => {
    if (!faucetUrl || !account?.address) {
      return '';
    }

    if (faucetUrl.includes('{address}') || faucetUrl.includes('{network}')) {
      return faucetUrl
        .replace('{address}', account.address)
        .replace('{network}', networkName);
    }

    const separator = faucetUrl.includes('?') ? '&' : '?';
    return `${faucetUrl}${separator}address=${encodeURIComponent(
      account.address
    )}&network=${encodeURIComponent(networkName)}`;
  };

  const resetAuthState = () => {
    authStatus = 'idle';
    authError = null;
    authSummary = null;
    authContext = null;
    account = null;
    balanceStatus = 'idle';
    balanceError = null;
    nativeBalance = null;
    ledgerBalance = null;
    pkpError = null;
    pkpInfo = null;
    pkps = [];
    pkpPublicKey = '';
    pkpSignature = null;
    pkpStatus = 'idle';
  };

  const handleNetworkChange = (event) => {
    networkName = event.target.value;
    resetAuthState();
  };

  const refreshBalances = async (targetAccount = account) => {
    if (!targetAccount?.address) {
      balanceError = 'Create an EOA auth context first.';
      return;
    }

    balanceStatus = 'working';
    balanceError = null;
    nativeBalance = null;
    ledgerBalance = null;

    let litClient = null;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const { viemConfig, rpcUrl } = litClient.getChainConfig();
      const publicClient = createPublicClient({
        chain: viemConfig,
        transport: http(rpcUrl),
      });

      const [nativeBalanceWei, paymentManager] = await Promise.all([
        publicClient.getBalance({ address: targetAccount.address }),
        litClient.getPaymentManager({ account: targetAccount }),
      ]);

      const ledger = await paymentManager.getBalance({
        userAddress: targetAccount.address,
      });

      nativeBalance = formatEther(nativeBalanceWei);
      ledgerBalance = ledger;
    } catch (err) {
      balanceError = err instanceof Error ? err.message : String(err);
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      balanceStatus = 'idle';
    }
  };

  const handleCreateAuthContext = async () => {
    authStatus = 'working';
    authError = null;
    authSummary = null;
    authContext = null;
    account = null;
    pkpError = null;
    pkpInfo = null;
    pkps = [];
    pkpSignature = null;
    pkpStatus = 'idle';

    try {
      const newAccount = privateKeyToAccount(generatePrivateKey());
      const authManager = createAuthManager({
        storage: storagePlugins.localStorage({
          appName: 'auth-svelte-test',
          networkName,
        }),
      });

      const litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      try {
        const createdAuthContext = await authManager.createEoaAuthContext({
          config: { account: newAccount },
          authConfig: {
            domain: window.location.origin,
            statement: 'EOA auth context demo',
            expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            resources: [
              ['lit-action-execution', '*'],
              ['pkp-signing', '*'],
            ],
          },
          litClient,
        });

        authContext = createdAuthContext;
        account = newAccount;
        authSummary = {
          account: newAccount.address,
          sessionKeyPublicKey: createdAuthContext.sessionKeyPair.publicKey,
          authMethodId: createdAuthContext.authData.authMethodId,
          expiration: createdAuthContext.authConfig.expiration,
        };

        await refreshBalances(newAccount);
      } finally {
        await litClient.disconnect();
      }
    } catch (err) {
      authError = err instanceof Error ? err.message : String(err);
    } finally {
      authStatus = 'idle';
    }
  };

  const handleFindPkps = async () => {
    if (!authContext || !account?.address) {
      pkpError = 'Create an EOA auth context first.';
      return;
    }

    pkpStatus = 'working';
    pkpError = null;
    pkpInfo = null;

    let litClient = null;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const { pkps: addressPkps } = await litClient.viewPKPsByAddress({
        ownerAddress: account.address,
        pagination: { limit: 5 },
      });

      if (!addressPkps || addressPkps.length === 0) {
        pkpInfo = {
          message: 'No PKPs found for this address. Mint one before signing.',
        };
        return;
      }

      pkps = addressPkps;
      pkpPublicKey = addressPkps[0].pubkey;
      pkpInfo = addressPkps[0];
    } catch (err) {
      pkpError = err instanceof Error ? err.message : String(err);
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      pkpStatus = 'idle';
    }
  };

  const handleMintPkp = async () => {
    if (!account) {
      pkpError = 'Create an EOA auth context first.';
      return;
    }

    pkpStatus = 'working';
    pkpError = null;
    pkpSignature = null;

    let litClient = null;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const result = await litClient.mintWithEoa({ account });
      const minted = result?.data ?? result;

      if (minted?.pubkey) {
        if (!pkps.some((pkp) => pkp.pubkey === minted.pubkey)) {
          pkps = [...pkps, minted];
        }
        pkpPublicKey = minted.pubkey;
      }

      pkpInfo = {
        ...minted,
        txHash: result?.txHash,
      };

      await refreshBalances(account);
    } catch (err) {
      pkpError = err instanceof Error ? err.message : String(err);
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      pkpStatus = 'idle';
    }
  };

  const handlePkpSign = async () => {
    if (!authContext) {
      pkpError = 'Create an EOA auth context first.';
      return;
    }

    if (!pkpPublicKey.trim()) {
      pkpError = 'Provide a PKP public key to sign with.';
      return;
    }

    pkpStatus = 'working';
    pkpError = null;
    pkpSignature = null;

    let litClient = null;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const result = await litClient.chain.ethereum.pkpSign({
        authContext,
        pubKey: pkpPublicKey.trim(),
        toSign: pkpMessage,
      });

      pkpSignature = result.signature;
    } catch (err) {
      pkpError = err instanceof Error ? err.message : String(err);
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      pkpStatus = 'idle';
    }
  };

  $: faucetLink = buildFaucetLink();
</script>

<main>
  <h1>Lit Auth Svelte Demo</h1>

  <section>
    <h2>EOA auth context demo</h2>
    <p>
      This uses a random EOA account and creates an auth context via the Auth
      Manager.
    </p>
    <label>
      Network:
      <select value={networkName} on:change={handleNetworkChange}>
        <option value="naga-dev">naga-dev</option>
        <option value="naga-test">naga-test</option>
      </select>
    </label>
    <div class="actions">
      <button type="button" on:click={handleCreateAuthContext} disabled={authStatus === 'working'}>
        {authStatus === 'working' ? 'Creating...' : 'Create EOA Auth Context'}
      </button>
    </div>
    {#if authError}
      <pre>Error: {authError}</pre>
    {/if}
    {#if authSummary}
      <pre>{stringify(authSummary)}</pre>
    {/if}
  </section>

  {#if account}
    <section>
      <h3>Fund your EOA</h3>
      <p>EOA address: {account.address}</p>
      <label>
        Faucet URL:
        <input type="text" bind:value={faucetUrl} />
      </label>
      {#if faucetLink}
        <div>
          <a href={faucetLink} target="_blank" rel="noreferrer">
            Open faucet
          </a>
        </div>
      {/if}
      <div class="actions">
        <button type="button" on:click={() => refreshBalances()} disabled={balanceStatus === 'working'}>
          {balanceStatus === 'working' ? 'Refreshing...' : 'Refresh balances'}
        </button>
      </div>
      <div>
        <p>Native balance: {nativeBalance ?? 'n/a'}</p>
        <p>
          Ledger balance:
          {#if ledgerBalance}
            {ledgerBalance.availableBalance} (available) / {ledgerBalance.totalBalance} (total)
          {:else}
            n/a
          {/if}
        </p>
      </div>
      {#if balanceError}
        <pre>Error: {balanceError}</pre>
      {/if}
    </section>
  {/if}

  <section>
    <h2>PKP sign demo</h2>
    <p>Provide a PKP public key minted for this address to sign a message.</p>
    <div class="actions">
      <button type="button" on:click={handleFindPkps} disabled={pkpStatus === 'working' || !authContext}>
        {pkpStatus === 'working' ? 'Searching...' : 'Find PKPs'}
      </button>
      <button type="button" on:click={handleMintPkp} disabled={pkpStatus === 'working' || !authContext}>
        {pkpStatus === 'working' ? 'Minting...' : 'Mint PKP'}
      </button>
    </div>
    {#if pkps.length}
      <label>
        Select PKP:
        <select
          bind:value={pkpPublicKey}
          on:change={(event) => {
            const selected = event.target.value;
            pkpPublicKey = selected;
            pkpInfo = pkps.find((pkp) => pkp.pubkey === selected) ?? null;
          }}
        >
          {#each pkps as pkp}
            <option value={pkp.pubkey}>
              {pkp.ethAddress ? `${pkp.ethAddress} (${String(pkp.tokenId)})` : pkp.pubkey}
            </option>
          {/each}
        </select>
      </label>
    {/if}
    <label>
      PKP public key:
      <input type="text" bind:value={pkpPublicKey} placeholder="0x..." />
    </label>
    <label>
      Message to sign:
      <input type="text" bind:value={pkpMessage} />
    </label>
    <div class="actions">
      <button type="button" on:click={handlePkpSign} disabled={pkpStatus === 'working' || !authContext}>
        {pkpStatus === 'working' ? 'Signing...' : 'PKP Sign Message'}
      </button>
    </div>
    {#if pkpInfo}
      <pre>{stringify(pkpInfo)}</pre>
    {/if}
    {#if pkpError}
      <pre>Error: {pkpError}</pre>
    {/if}
    {#if pkpSignature}
      <pre>Signature: {pkpSignature}</pre>
    {/if}
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #0f1117;
    color: #f5f7ff;
  }

  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem;
    display: grid;
    gap: 1.5rem;
  }

  section {
    background: #171a24;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    border: 1px solid #2b2f3a;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.75rem;
  }

  input,
  select {
    padding: 0.5rem 0.65rem;
    border-radius: 8px;
    border: 1px solid #343a4a;
    background: #0c0e16;
    color: inherit;
  }

  button {
    padding: 0.5rem 0.9rem;
    border-radius: 8px;
    border: none;
    background: #4f46e5;
    color: white;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .actions {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  pre {
    background: #0c0e16;
    padding: 0.75rem;
    border-radius: 8px;
    overflow-x: auto;
  }
</style>
