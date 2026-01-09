"use client";

import { useState } from "react";
import { createAuthManager } from "@lit-protocol/auth";
import { storagePlugins } from "@lit-protocol/auth/storage";
import { createLitClient } from "@lit-protocol/lit-client";
import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createPublicClient, formatEther, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const NETWORKS = {
  "naga-dev": nagaDev,
  "naga-test": nagaTest,
};

const DEFAULT_FAUCET_URL =
  "https://chronicle-yellowstone-faucet.getlit.dev/naga";

export default function ClientStorageDemo() {
  const [networkName, setNetworkName] = useState("naga-dev");
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState(null);
  const [authSummary, setAuthSummary] = useState(null);
  const [authContext, setAuthContext] = useState(null);
  const [account, setAccount] = useState(null);
  const [balanceStatus, setBalanceStatus] = useState("idle");
  const [balanceError, setBalanceError] = useState(null);
  const [nativeBalance, setNativeBalance] = useState(null);
  const [ledgerBalance, setLedgerBalance] = useState(null);

  const [pkpStatus, setPkpStatus] = useState("idle");
  const [pkpError, setPkpError] = useState(null);
  const [pkpInfo, setPkpInfo] = useState(null);
  const [pkps, setPkps] = useState([]);
  const [pkpPublicKey, setPkpPublicKey] = useState("");
  const [pkpMessage, setPkpMessage] = useState("Hello, world!");
  const [pkpSignature, setPkpSignature] = useState(null);
  const [faucetUrl, setFaucetUrl] = useState(DEFAULT_FAUCET_URL);

  const stringify = (value) =>
    JSON.stringify(
      value,
      (_key, val) => (typeof val === "bigint" ? val.toString() : val),
      2
    );

  const buildFaucetLink = () => {
    if (!faucetUrl || !account?.address) {
      return "";
    }

    if (faucetUrl.includes("{address}") || faucetUrl.includes("{network}")) {
      return faucetUrl
        .replace("{address}", account.address)
        .replace("{network}", networkName);
    }

    const separator = faucetUrl.includes("?") ? "&" : "?";
    return `${faucetUrl}${separator}address=${encodeURIComponent(
      account.address
    )}&network=${encodeURIComponent(networkName)}`;
  };

  const resetAuthState = () => {
    setAuthStatus("idle");
    setAuthError(null);
    setAuthSummary(null);
    setAuthContext(null);
    setAccount(null);
    setBalanceStatus("idle");
    setBalanceError(null);
    setNativeBalance(null);
    setLedgerBalance(null);
    setPkpError(null);
    setPkpInfo(null);
    setPkps([]);
    setPkpPublicKey("");
    setPkpSignature(null);
    setPkpStatus("idle");
  };

  const handleNetworkChange = (event) => {
    setNetworkName(event.target.value);
    resetAuthState();
  };

  const handleCreateAuthContext = async () => {
    setAuthStatus("working");
    setAuthError(null);
    setAuthSummary(null);
    setAuthContext(null);
    setAccount(null);
    setBalanceStatus("idle");
    setBalanceError(null);
    setNativeBalance(null);
    setLedgerBalance(null);
    setPkpError(null);
    setPkpInfo(null);
    setPkps([]);
    setPkpSignature(null);
    setPkpStatus("idle");

    try {
      const newAccount = privateKeyToAccount(generatePrivateKey());
      const authManager = createAuthManager({
        storage: storagePlugins.localStorage({
          appName: "auth-nextjs-test",
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
            statement: "EOA auth context demo",
            expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            resources: [
              ["lit-action-execution", "*"],
              ["pkp-signing", "*"],
            ],
          },
          litClient,
        });

        setAuthContext(createdAuthContext);
        setAccount(newAccount);
        setAuthSummary({
          account: newAccount.address,
          sessionKeyPublicKey: createdAuthContext.sessionKeyPair.publicKey,
          authMethodId: createdAuthContext.authData.authMethodId,
          expiration: createdAuthContext.authConfig.expiration,
        });

        await refreshBalances(newAccount);
      } finally {
        await litClient.disconnect();
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthStatus("idle");
    }
  };

  const refreshBalances = async (targetAccount = account) => {
    if (!targetAccount?.address) {
      setBalanceError("Create an EOA auth context first.");
      return;
    }

    setBalanceStatus("working");
    setBalanceError(null);
    setNativeBalance(null);
    setLedgerBalance(null);

    let litClient;
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

      setNativeBalance(formatEther(nativeBalanceWei));
      setLedgerBalance(ledger);
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : String(err));
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      setBalanceStatus("idle");
    }
  };

  const handleFindPkps = async () => {
    if (!authContext || !account?.address) {
      setPkpError("Create an EOA auth context first.");
      return;
    }

    setPkpStatus("working");
    setPkpError(null);
    setPkpInfo(null);

    let litClient;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const { pkps: addressPkps } = await litClient.viewPKPsByAddress({
        ownerAddress: account.address,
        pagination: { limit: 5 },
      });

      if (!addressPkps || addressPkps.length === 0) {
        setPkpInfo({
          message:
            "No PKPs found for this auth method. Mint one before signing.",
        });
        return;
      }

      setPkps(addressPkps);
      setPkpPublicKey(addressPkps[0].pubkey);
      setPkpInfo(addressPkps[0]);
    } catch (err) {
      setPkpError(err instanceof Error ? err.message : String(err));
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      setPkpStatus("idle");
    }
  };

  const handleMintPkp = async () => {
    if (!account) {
      setPkpError("Create an EOA auth context first.");
      return;
    }

    setPkpStatus("working");
    setPkpError(null);
    setPkpSignature(null);

    let litClient;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const result = await litClient.mintWithEoa({ account });
      const minted = result?.data ?? result;

      if (minted?.pubkey) {
        setPkps((prev) => {
          if (prev.some((pkp) => pkp.pubkey === minted.pubkey)) {
            return prev;
          }
          return [...prev, minted];
        });
        setPkpPublicKey(minted.pubkey);
      }

      setPkpInfo({
        ...minted,
        txHash: result?.txHash,
      });

      await refreshBalances(account);
    } catch (err) {
      setPkpError(err instanceof Error ? err.message : String(err));
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      setPkpStatus("idle");
    }
  };

  const handlePkpSign = async () => {
    if (!authContext) {
      setPkpError("Create an EOA auth context first.");
      return;
    }

    if (!pkpPublicKey.trim()) {
      setPkpError("Provide a PKP public key to sign with.");
      return;
    }

    setPkpStatus("working");
    setPkpError(null);
    setPkpSignature(null);

    let litClient;
    try {
      litClient = await createLitClient({
        network: NETWORKS[networkName],
      });

      const result = await litClient.chain.ethereum.pkpSign({
        authContext,
        pubKey: pkpPublicKey.trim(),
        toSign: pkpMessage,
      });

      setPkpSignature(result.signature);
    } catch (err) {
      setPkpError(err instanceof Error ? err.message : String(err));
    } finally {
      if (litClient) {
        await litClient.disconnect();
      }
      setPkpStatus("idle");
    }
  };

  const faucetLink = buildFaucetLink();

  return (
    <section>
      <h2>Client storage plugins</h2>
      <pre>{Object.keys(storagePlugins).join(", ")}</pre>

      <h2>EOA auth context demo</h2>
      <p>
        This uses a random EOA account and creates an auth context via the Auth
        Manager.
      </p>
      <label>
        Network:{" "}
        <select
          value={networkName}
          onChange={handleNetworkChange}
        >
          <option value="naga-dev">naga-dev</option>
          <option value="naga-test">naga-test</option>
        </select>
      </label>
      <div>
        <button
          type="button"
          onClick={handleCreateAuthContext}
          disabled={authStatus === "working"}
        >
          {authStatus === "working"
            ? "Creating..."
            : "Create EOA Auth Context"}
        </button>
      </div>
      {authError ? <pre>Error: {authError}</pre> : null}
      {authSummary ? <pre>{stringify(authSummary)}</pre> : null}

      {account ? (
        <section>
          <h3>Fund your EOA</h3>
          <p>EOA address: {account.address}</p>
          <label>
            Faucet URL:
            <input
              type="text"
              value={faucetUrl}
              onChange={(event) => setFaucetUrl(event.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          {faucetLink ? (
            <div>
              <a href={faucetLink} target="_blank" rel="noreferrer">
                Open faucet
              </a>
            </div>
          ) : null}
          <div>
            <button
              type="button"
              onClick={() => refreshBalances()}
              disabled={balanceStatus === "working"}
            >
              {balanceStatus === "working" ? "Refreshing..." : "Refresh balances"}
            </button>
          </div>
          <div>
            <p>Native balance: {nativeBalance ?? "n/a"}</p>
            <p>
              Ledger balance:{" "}
              {ledgerBalance
                ? `${ledgerBalance.availableBalance} (available) / ${ledgerBalance.totalBalance} (total)`
                : "n/a"}
            </p>
          </div>
          {balanceError ? <pre>Error: {balanceError}</pre> : null}
        </section>
      ) : null}

      <h2>PKP sign demo</h2>
      <p>
        Provide a PKP public key minted for this auth method to sign a message.
      </p>
      <div>
        <button
          type="button"
          onClick={handleFindPkps}
          disabled={pkpStatus === "working" || !authContext}
        >
          {pkpStatus === "working" ? "Searching..." : "Find PKPs"}
        </button>
        <button
          type="button"
          onClick={handleMintPkp}
          disabled={pkpStatus === "working" || !authContext}
        >
          {pkpStatus === "working" ? "Minting..." : "Mint PKP"}
        </button>
      </div>
      {pkps.length ? (
        <label>
          Select PKP:
          <select
            value={pkpPublicKey}
            onChange={(event) => {
              const selected = event.target.value;
              setPkpPublicKey(selected);
              const selectedPkp = pkps.find(
                (pkp) => pkp.pubkey === selected
              );
              setPkpInfo(selectedPkp ?? null);
            }}
          >
            {pkps.map((pkp) => (
              <option key={pkp.pubkey} value={pkp.pubkey}>
                {pkp.ethAddress
                  ? `${pkp.ethAddress} (${String(pkp.tokenId)})`
                  : pkp.pubkey}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        PKP public key:
        <input
          type="text"
          value={pkpPublicKey}
          onChange={(event) => setPkpPublicKey(event.target.value)}
          placeholder="0x..."
          style={{ width: "100%" }}
        />
      </label>
      <label>
        Message to sign:
        <input
          type="text"
          value={pkpMessage}
          onChange={(event) => setPkpMessage(event.target.value)}
          style={{ width: "100%" }}
        />
      </label>
      <div>
        <button
          type="button"
          onClick={handlePkpSign}
          disabled={pkpStatus === "working" || !authContext}
        >
          {pkpStatus === "working" ? "Signing..." : "PKP Sign Message"}
        </button>
      </div>
      {pkpInfo ? <pre>{stringify(pkpInfo)}</pre> : null}
      {pkpError ? <pre>Error: {pkpError}</pre> : null}
      {pkpSignature ? <pre>Signature: {pkpSignature}</pre> : null}
    </section>
  );
}
