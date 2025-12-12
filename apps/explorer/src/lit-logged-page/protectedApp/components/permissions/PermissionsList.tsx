/**
 * PermissionsList Component
 * 
 * Displays current PKP permissions with ability to remove them
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAddress, isAddress } from 'viem';

import { useLitAuth } from '../../../../lit-login-modal/LitAuthProvider';
import { usePKPPermissions } from '../../contexts/PKPPermissionsContext';
import { AUTH_METHOD_TYPE } from '../../types';
import { hexToIpfsCid, getAuthMethodTypeName } from '../../utils';
import { triggerLedgerRefresh } from '../../utils/ledgerRefresh';
import { RemoveButton } from '../ui/RemoveButton';

import type { FC } from "react";

export const PermissionsList: FC = () => {
  const {
    permissionsContext,
    removingItems,
    removePermittedAction,
    removePermittedAddress,
    removePermittedAuthMethod,
    selectedPkp,
  } = usePKPPermissions();
  const { user } = useLitAuth();

  const currentAuthType: number | undefined = user?.authData?.authMethodType;
  const currentAuthIdRaw: string = (user?.authData?.authMethodId || '') as string;

  const normaliseAuthId = (typeNumber: number, id?: string): string => {
    if (!id) return '';
    // Normalise EVM addresses for EthWallet type; lowercase fallback for others
    if (Number(typeNumber) === AUTH_METHOD_TYPE.EthWallet) {
      try {
        if (isAddress(id)) return getAddress(id).toLowerCase();
      } catch {
        // ignore invalid address format
      }
    }
    return String(id).toLowerCase();
  };

  const isCurrentSessionAuthMethod = (method: { authMethodType: number | string; id?: string }): boolean => {
    const methodType = Number(method.authMethodType);
    if (currentAuthType === undefined || currentAuthType === null) return false;
    if (methodType !== Number(currentAuthType)) return false;
    const a = normaliseAuthId(methodType, method.id);
    const b = normaliseAuthId(Number(currentAuthType), currentAuthIdRaw);
    return !!a && !!b && a === b;
  };

  const handleRemoveAction = async (actionCid: string) => {
    const ok = window.confirm(
      `Are you sure you want to remove this permitted action?\n\nIPFS CID: ${actionCid}`
    );
    if (!ok) return;
    await removePermittedAction(actionCid);
    try {
      const addr = selectedPkp?.ethAddress || user?.pkpInfo?.ethAddress;
      if (addr) await triggerLedgerRefresh(addr);
    } catch {
      // ignore ledger refresh errors
    }
  };

  const handleRemoveAddress = async (address: string) => {
    const ok = window.confirm(
      `Are you sure you want to remove this permitted address?\n\nAddress: ${address}`
    );
    if (!ok) return;
    await removePermittedAddress(address);
    try {
      const addr = selectedPkp?.ethAddress || user?.pkpInfo?.ethAddress;
      if (addr) await triggerLedgerRefresh(addr);
    } catch {
      // ignore ledger refresh errors
    }
  };

  const handleRemoveAuthMethod = async (
    authType: number,
    authId: string,
    displayId: string,
    isCurrent: boolean
  ) => {
    const typeName = getAuthMethodTypeName(authType);
    const baseMsg = `Are you sure you want to remove this auth method?\n\nType: ${typeName}\nID: ${displayId || authId}`;
    const ok = window.confirm(
      isCurrent
        ? `${baseMsg}\n\n❗️❗️ Warning: This matches your current session's authentication and removing it will block you from authenticating this PKP with the current auth method again.`
        : baseMsg
    );
    if (!ok) return;

    if (isCurrent) {
      const typed = window.prompt(
        `Type DELETE to confirm removing the current session's auth method.`
      );
      if ((typed || '').trim().toUpperCase() !== 'DELETE') return;
    }

    await removePermittedAuthMethod(authType, authId);
    try {
      const addr = selectedPkp?.ethAddress || user?.pkpInfo?.ethAddress;
      if (addr) await triggerLedgerRefresh(addr);
    } catch {
      // ignore ledger refresh errors
    }
  };

  if (!permissionsContext) {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        No permissions loaded. Click "Refresh" to load current permissions.
      </div>
    );
  }

  const hasPermissions = 
    (permissionsContext.actions && permissionsContext.actions.length > 0) ||
    (permissionsContext.addresses && permissionsContext.addresses.length > 0) ||
    (permissionsContext.authMethods && permissionsContext.authMethods.length > 0);

  if (!hasPermissions) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#6b7280",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px dashed #d1d5db",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔓</div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "8px",
          }}
        >
          No Permissions Set
        </div>
        <div style={{ fontSize: "14px" }}>
          This PKP has no specific permissions configured. Use the forms below to add permissions.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {/* Permitted Actions */}
      {permissionsContext.actions && permissionsContext.actions.length > 0 && (
        <div>
          <h4
            style={{
              margin: "0 0 12px 0",
              color: "#374151",
              fontSize: "16px",
            }}
          >
            ⚡ Permitted Actions ({permissionsContext.actions.length})
          </h4>
          <div style={{ display: "grid", gap: "8px" }}>
            {permissionsContext.actions.map((action: string, index: number) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "monospace",
                      color: "#1e40af",
                      marginBottom: "4px",
                    }}
                  >
                    <a
                      href={`https://explorer.litprotocol.com/ipfs/${action}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1e40af",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#1d4ed8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#1e40af";
                      }}
                    >
                      {action}
                    </a>
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>
                    📎 IPFS CID (Lit Action Identifier) - Click to view
                  </div>
                </div>
                <RemoveButton
                  onRemove={() => handleRemoveAction(action)}
                  isRemoving={removingItems.has(`action:${action}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permitted Addresses */}
      {permissionsContext.addresses && permissionsContext.addresses.length > 0 && (
        <div>
          <h4
            style={{
              margin: "0 0 12px 0",
              color: "#374151",
              fontSize: "16px",
            }}
          >
            🏠 Permitted Addresses ({(() => {
              try {
                const normalise = (addr: string) => {
                  try {
                    return getAddress(addr).toLowerCase();
                  } catch {
                    return String(addr).toLowerCase();
                  }
                };
                const unique = Array.from(new Set(permissionsContext.addresses.map((a: string) => normalise(a))));
                return unique.length;
              } catch {
                return permissionsContext.addresses.length;
              }
            })()})
          </h4>
          <div style={{ display: "grid", gap: "8px" }}>
            {(() => {
              // Build unique list (case-insensitive, checksum-normalised when possible)
              const addresses: string[] = permissionsContext.addresses;
              const normalise = (addr: string) => {
                try {
                  return getAddress(addr).toLowerCase();
                } catch {
                  return String(addr).toLowerCase();
                }
              };
              const uniqueKeys = Array.from(new Set(addresses.map((a: string) => normalise(a))));
              const uniqueAddresses = uniqueKeys.map((key: string) => {
                const original = addresses.find((a: string) => normalise(a) === key) as string;
                return original;
              });

              return uniqueAddresses.map((address: string, index: number) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "monospace",
                      color: "#15803d",
                      marginBottom: "4px",
                    }}
                  >
                    {address}
                    {(() => {
                      try {
                        if (
                          selectedPkp?.ethAddress &&
                          isAddress(address) &&
                          isAddress(selectedPkp.ethAddress) &&
                          getAddress(address) === getAddress(selectedPkp.ethAddress)
                        ) {
                          return (
                            <span style={{ marginLeft: "8px", color: "#065f46", fontSize: "11px" }}>
                              (PKP Itself)
                            </span>
                          );
                        }
                      } catch {
                        // ignore address comparison errors
                      }
                      return null;
                    })()}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>
                    Ethereum Address
                  </div>
                </div>
                <RemoveButton
                  onRemove={() => handleRemoveAddress(address)}
                  isRemoving={removingItems.has(`address:${address}`)}
                />
              </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Auth Methods */}
      {permissionsContext.authMethods && permissionsContext.authMethods.length > 0 && (
        <div>
          <h4
            style={{
              margin: "0 0 12px 0",
              color: "#374151",
              fontSize: "16px",
            }}
          >
            🔑 Auth Methods ({permissionsContext.authMethods.length})
          </h4>
          <div style={{ display: "grid", gap: "8px" }}>
            {permissionsContext.authMethods.map((authMethod: any, index: number) => {
              const authType = Number(authMethod.authMethodType);
              const isLitAction = authType === AUTH_METHOD_TYPE.LitAction;
              const isEthWallet = authType === AUTH_METHOD_TYPE.EthWallet;
              const displayId = (() => {
                if (isLitAction && authMethod.id) return hexToIpfsCid(authMethod.id);
                if (isEthWallet && authMethod.id) {
                  try {
                    return getAddress(authMethod.id);
                  } catch {
                    return authMethod.id || "";
                  }
                }
                return authMethod.id || "";
              })();
              const isCurrent = isCurrentSessionAuthMethod(authMethod);

              return (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    backgroundColor: "#faf5ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontFamily: "monospace",
                        color: "#7c3aed",
                        marginBottom: "4px",
                      }}
                    >
                      {isLitAction ? (
                        <a
                          href={`https://explorer.litprotocol.com/ipfs/${displayId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#7c3aed",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#5b21b6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#7c3aed";
                          }}
                        >
                          {displayId}
                        </a>
                      ) : (
                        (() => {
                          const isCurrentPkpEth = (() => {
                            try {
                              return (
                                isEthWallet &&
                                selectedPkp?.ethAddress &&
                                isAddress(authMethod.id) &&
                                isAddress(selectedPkp.ethAddress) &&
                                getAddress(authMethod.id) === getAddress(selectedPkp.ethAddress)
                              );
                            } catch {
                              return false;
                            }
                          })();
                          return (
                            <>
                              {displayId}
                              {isCurrentPkpEth && (
                                <span style={{ marginLeft: "8px", color: "#065f46", fontSize: "11px" }}>
                                  (PKP Itself)
                                </span>
                              )}
                            </>
                          );
                        })()
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      <strong>Type:</strong> {getAuthMethodTypeName(authType)}
                      {isCurrent && (
                        <span style={{ color: "#b45309", marginLeft: "8px" }}>
                          (Current session)
                        </span>
                      )}
                      {isLitAction && (
                        <span style={{ color: "#059669", marginLeft: "8px" }}>
                          📎 (IPFS Link)
                        </span>
                      )}
                    </div>
                    {authMethod.scopes && authMethod.scopes.length > 0 && (
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        <strong>Scopes:</strong>{" "}
                        {Array.isArray(authMethod.scopes)
                          ? authMethod.scopes.join(", ")
                          : authMethod.scopes}
                      </div>
                    )}
                    {authMethod.scopes && authMethod.scopes.length === 0 && (
                      <div style={{ fontSize: "11px", color: "#ef4444" }}>
                        <strong>Scopes:</strong> None (no permissions)
                      </div>
                    )}
                  </div>
                  <RemoveButton
                    onRemove={() =>
                      handleRemoveAuthMethod(
                        authType,
                        authMethod.id,
                        String(displayId),
                        isCurrent
                      )
                    }
                    isRemoving={removingItems.has(`${authType}:${authMethod.id}`)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 
