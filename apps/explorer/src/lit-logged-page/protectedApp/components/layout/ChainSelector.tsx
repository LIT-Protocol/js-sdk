/**
 * ChainSelector Component
 *
 * Purpose:
 *  - Render a selector for blockchain networks
 *  - Support both default and user-defined custom chains
 *
 * Usage:
 *  - Provide `selectedChain` as the chain slug
 *  - Handle `onChainChange(slug)` to persist selection upstream
 *
 * Notes:
 *  - Custom chains are stored locally via the registry utilities
 */

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  getAllChains,
  isCustomChain,
  addCustomChain,
  removeCustomChain,
  getCustomChains,
} from "@/domain/lit/chains";

interface ChainSelectorProps {
  selectedChain: string;
  onChainChange: (chain: string) => void;
  disabled?: boolean;
  iconTrigger?: boolean;
  triggerAriaLabel?: string;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChain,
  onChainChange,
  disabled = false,
  iconTrigger = false,
  triggerAriaLabel = 'Select chain',
}) => {
  const [chains, setChains] = React.useState<Record<string, { name: string; symbol: string; testnet: boolean }>>({});
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState({
    slug: "",
    id: "",
    name: "",
    symbol: "",
    rpcUrl: "",
    explorerUrl: "",
    testnet: false,
  });
  const [error, setError] = React.useState<string | null>(null);

  const refreshChains = React.useCallback(() => {
    const all = getAllChains();
    // Map to minimal view for rendering
    const minimal: Record<string, { name: string; symbol: string; testnet: boolean }> = {};
    Object.entries(all).forEach(([k, v]) => {
      minimal[k] = { name: v.name, symbol: v.symbol, testnet: v.testnet };
    });
    setChains(minimal);
  }, []);

  React.useEffect(() => {
    refreshChains();
  }, [refreshChains]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('chains.custom.v1')) {
        refreshChains();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshChains]);

  function handleSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const idNum = Number(addForm.id);
    const result = addCustomChain(addForm.slug.trim(), {
      id: Number.isFinite(idNum) ? idNum : -1,
      name: addForm.name.trim(),
      symbol: addForm.symbol.trim(),
      rpcUrl: addForm.rpcUrl.trim(),
      explorerUrl: addForm.explorerUrl.trim(),
      litIdentifier: addForm.slug.trim(),
      testnet: Boolean(addForm.testnet),
    } as any);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setIsAddOpen(false);
    setAddForm({ slug: "", id: "", name: "", symbol: "", rpcUrl: "", explorerUrl: "", testnet: false });
    refreshChains();
  }

  function handleRemove(slug: string) {
    removeCustomChain(slug);
    if (selectedChain === slug) {
      // If the currently selected chain was removed, keep the selection unchanged upstream.
      // The parent may choose to override. We only refresh the list here.
    }
    refreshChains();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        {iconTrigger ? (
          <button
            aria-label={triggerAriaLabel}
            title={triggerAriaLabel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 6,
              background: disabled ? '#f3f4f6' : 'transparent',
              color: '#0c4a6e',
              cursor: disabled ? 'not-allowed' : 'pointer',
              border: '1px solid transparent',
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              style={{ width: 16, height: 16, opacity: 0.9 }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
        ) : (
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: disabled ? "#f3f4f6" : "white",
              color: disabled ? "#9ca3af" : "#374151",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: 600,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {(() => {
              const chain = chains[selectedChain as keyof typeof chains] as
                | { name: string; symbol: string; testnet: boolean }
                | undefined;
              const label = chain
                ? `${chain.name} (${chain.symbol})${chain.testnet ? " - Testnet" : ""}`
                : selectedChain;
              const custom = selectedChain ? isCustomChain(selectedChain) : false;
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>{label}</span>
                  {custom && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#9A3412',
                        background: '#FFF7ED',
                        border: '1px solid #FED7AA',
                        padding: '1px 6px',
                        borderRadius: 9999,
                      }}
                    >
                      Custom
                    </span>
                  )}
                </span>
              );
            })()}
            <ChevronDown size={14} />
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "6px",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            minWidth: 260,
            zIndex: 9999,
          }}
        >
          {!isAddOpen && (
            <>
              <DropdownMenu.RadioGroup
                value={selectedChain}
                onValueChange={(value) => onChainChange(value)}
              >
                {Object.entries(chains).map(([key, chain]) => {
                  const custom = isCustomChain(key);
                  return (
                    <DropdownMenu.RadioItem
                      key={key}
                      value={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: 'space-between',
                        gap: "8px",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        color: "#111827",
                        background: custom ? '#FFFBEB' : 'transparent',
                      }}
                    >
                      <span>
                        {`${chain.name} (${chain.symbol})${chain.testnet ? " - Testnet" : ""}`}
                      </span>
                      {custom && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#9A3412',
                            background: '#FFF7ED',
                            border: '1px solid #FED7AA',
                            padding: '1px 6px',
                            borderRadius: 9999,
                          }}
                        >
                          Custom
                        </span>
                      )}
                    </DropdownMenu.RadioItem>
                  );
                })}
              </DropdownMenu.RadioGroup>

              <div style={{ height: 8 }} />
              <div style={{ borderTop: '1px solid #E5E7EB', margin: '6px -6px' }} />
            </>
          )}

          {!isAddOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <DropdownMenu.Item
                onSelect={(e) => {
                  e.preventDefault();
                  setIsAddOpen(true);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#065F46',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                }}
              >
                Add custom chain…
              </DropdownMenu.Item>

              {Object.keys(getCustomChains()).length > 0 && (
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                      color: '#991B1B',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                    }}
                  >
                    Remove custom chain…
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '6px',
                      boxShadow:
                        '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                      minWidth: 220,
                    }}
                  >
                    {Object.keys(getCustomChains()).map((slug) => (
                      <DropdownMenu.Item
                        key={slug}
                        onSelect={(e) => {
                          e.preventDefault();
                          handleRemove(slug);
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: 'pointer',
                          color: '#991B1B',
                        }}
                      >
                        Remove {slug}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitAdd} onKeyDownCapture={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {error && (
                <div style={{
                  color: '#991B1B',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                }}>{error}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <input placeholder="slug"
                  value={addForm.slug}
                  onChange={(e) => setAddForm((s) => ({ ...s, slug: e.target.value }))}
                  style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#111827' }} />
                <input placeholder="id (number)"
                  value={addForm.id}
                  onChange={(e) => setAddForm((s) => ({ ...s, id: e.target.value }))}
                  style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#111827' }} />
                <input placeholder="name"
                  value={addForm.name}
                  onChange={(e) => setAddForm((s) => ({ ...s, name: e.target.value }))}
                  style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#111827' }} />
                <input placeholder="symbol"
                  value={addForm.symbol}
                  onChange={(e) => setAddForm((s) => ({ ...s, symbol: e.target.value }))}
                  style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#111827' }} />
                <input placeholder="rpcUrl"
                  value={addForm.rpcUrl}
                  onChange={(e) => setAddForm((s) => ({ ...s, rpcUrl: e.target.value }))}
                  style={{ gridColumn: '1 / span 2', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#111827' }} />
                <input placeholder="explorerUrl"
                  value={addForm.explorerUrl}
                  onChange={(e) => setAddForm((s) => ({ ...s, explorerUrl: e.target.value }))}
                  style={{ gridColumn: '1 / span 2', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#111827' }} />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <input type="checkbox"
                    checked={addForm.testnet}
                    onChange={(e) => setAddForm((s) => ({ ...s, testnet: e.target.checked }))} />
                  <span style={{ color: '#111827' }}>Testnet</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setIsAddOpen(false); setError(null); }}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    background: 'white',
                    color: '#111827',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>Cancel</button>
                <button type="submit"
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #22C55E',
                    borderRadius: 6,
                    background: '#22C55E',
                    color: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>Save</button>
              </div>
            </form>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
