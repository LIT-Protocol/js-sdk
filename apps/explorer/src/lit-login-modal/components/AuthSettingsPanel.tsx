/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupportedNetworkName } from "../types";
import type { FC } from "react";

interface AuthSettingsPanelProps {
  onClose: () => void;
  loginServiceBaseUrl: string;
  setLoginServiceBaseUrl: (value: string) => void;
  defaultLoginServiceBaseUrl: string;
  discordClientId: string;
  setDiscordClientId: (value: string) => void;
  defaultDiscordClientId: string;
  localNetworkName: string;
  setLocalNetworkName: (value: string) => void;
  supportedNetworks: SupportedNetworkName[];
  networkModules: Partial<Record<SupportedNetworkName, any>>;
  fallbackNetworkModule: any;
  setLocalNetwork: (network: any) => void;
  authServiceBaseUrl: string;
  setAuthServiceBaseUrl: (value: string) => void;
  networkDefaultAuthUrl: string;
  isAuthUrlCustom: (url: string) => boolean;
}

export const AuthSettingsPanel: FC<AuthSettingsPanelProps> = ({
  onClose,
  loginServiceBaseUrl,
  setLoginServiceBaseUrl,
  defaultLoginServiceBaseUrl,
  discordClientId,
  setDiscordClientId,
  defaultDiscordClientId,
  localNetworkName,
  setLocalNetworkName,
  supportedNetworks,
  networkModules,
  fallbackNetworkModule,
  setLocalNetwork,
  authServiceBaseUrl,
  setAuthServiceBaseUrl,
  networkDefaultAuthUrl,
  isAuthUrlCustom,
}) => {
  const networkMeta: Record<
    SupportedNetworkName,
    { label: string; dotClass: string }
  > = {
    "naga-dev": { label: "Testnet", dotClass: "bg-indigo-500" },
    "naga-test": { label: "Testnet", dotClass: "bg-green-500" },
    "naga-proto": { label: "Mainnet", dotClass: "bg-amber-500" },
    naga: { label: "Mainnet", dotClass: "bg-red-500" },
  };
  const activeMeta =
    networkMeta[localNetworkName as SupportedNetworkName] ||
    networkMeta["naga-dev"];

  const handleNetworkSelect = (net: SupportedNetworkName) => {
    const selected = networkModules[net] || fallbackNetworkModule;
    setLocalNetworkName(net);
    setLocalNetwork(selected);
  };

  return (
    <div className="text-black">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="m-0 text-[18px] font-semibold text-gray-900">
          Settings
        </h3>
        <button
          onClick={onClose}
          className="rounded px-2 py-1 text-[12px] text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      {/* Login Service URL (Global) */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-slate-50 p-3">
        <label className="mb-2 block text-[13px] font-semibold text-gray-900">
          Login Service URL
        </label>
        <div className="mb-2 text-[11px] text-gray-500">
          Global setting – applies to all networks.
        </div>
        <input
          type="url"
          value={loginServiceBaseUrl}
          onChange={(e) => setLoginServiceBaseUrl(e.target.value)}
          placeholder={defaultLoginServiceBaseUrl}
          className="w-full rounded border border-gray-300 px-2.5 py-2 font-mono text-[12px]"
        />
        <div className="mt-2">
          <button
            onClick={() => setLoginServiceBaseUrl(defaultLoginServiceBaseUrl)}
            className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-100"
          >
            Reset to default
          </button>
        </div>
      </div>

      {/* Discord Client ID (Global) */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-slate-50 p-3">
        <label className="mb-2 block text-[13px] font-semibold text-gray-900">
          Discord Client ID
        </label>
        <div className="mb-2 text-[11px] text-gray-500">
          Global setting – used for Discord authentication.
        </div>
        <input
          type="text"
          value={discordClientId}
          onChange={(e) => setDiscordClientId(e.target.value)}
          placeholder={defaultDiscordClientId}
          className="w-full rounded border border-gray-300 px-2.5 py-2 font-mono text-[12px]"
        />
        <div className="mt-2">
          <button
            onClick={() => setDiscordClientId(defaultDiscordClientId)}
            className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-100"
          >
            Reset to default
          </button>
        </div>
      </div>

      {/* Current network banner */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-gray-700">
            Network
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${activeMeta.dotClass}`}
            />
            <span className="font-mono">{localNetworkName}</span>
            <span className="text-[10px] uppercase tracking-wide text-gray-500">
              {activeMeta.label}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-gray-300 text-[10px] leading-3 text-white">
            i
          </span>
          <span>Auth Service URL applies only to this network</span>
        </div>
      </div>

      {/* Network selection as tabs */}
      <div className="mb-2 rounded-lg border border-gray-200 bg-slate-50 p-3">
        <label className="mb-2 block text-[13px] font-semibold text-gray-900">
          Network
        </label>
        <div className="flex gap-2 border-b border-gray-200">
          {supportedNetworks.map((net) => {
            const isActive = localNetworkName === net;
            return (
              <button
                key={net}
                onClick={() => handleNetworkSelect(net)}
                className={`-mb-px px-3 py-1.5 text-sm ${
                  isActive
                    ? "border-b-2 border-indigo-600 font-semibold text-indigo-700"
                    : "border-b-2 border-transparent text-gray-600 hover:text-gray-800"
                } cursor-pointer`}
                title={networkMeta[net]?.label}
              >
                {net}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auth Service URL */}
      <div className="rounded-lg border border-gray-200 bg-slate-50 p-3">
        <label className="mb-2 block text-[13px] font-semibold text-gray-900">
          Auth Service URL
        </label>
        <div className="mb-2 text-[11px] text-gray-500">
          This is saved per network. Changing network switches to that network's
          saved URL.
        </div>
        <input
          type="url"
          value={authServiceBaseUrl}
          onChange={(e) => setAuthServiceBaseUrl(e.target.value)}
          placeholder={networkDefaultAuthUrl}
          className="w-full rounded border border-gray-300 px-2.5 py-2 font-mono text-[12px]"
        />
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 ${
              isAuthUrlCustom(authServiceBaseUrl)
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {isAuthUrlCustom(authServiceBaseUrl) ? "Custom" : "Default"}
          </span>
          <span className="text-gray-500">
            Default: <span className="font-mono">{networkDefaultAuthUrl}</span>
          </span>
        </div>
        <div className="mt-2">
          <button
            onClick={() => setAuthServiceBaseUrl(networkDefaultAuthUrl)}
            className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-100"
          >
            Use network default
          </button>
        </div>
      </div>
    </div>
  );
};
