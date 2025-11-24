// Lightweight pub/sub for PKP ledger refresh events with queue system

import { useEffect } from "react";

export type LedgerRefreshDetail = { 
  address?: string | null;
  snapshotBalance?: string | null;
  shouldPollUntilStable?: boolean;
};

const EVENT_NAME = "ledger-refresh";
const SNAPSHOT_EVENT_NAME = "ledger-snapshot";

// Queue to handle sequential refresh requests
class RefreshQueue {
  private queue: Array<{ address?: string | null; snapshotBalance?: string | null; resolve: () => void }> = [];
  private processing = false;

  async add(address?: string | null, snapshotBalance?: string | null): Promise<void> {
    return new Promise((resolve) => {
      // Dispatch snapshot event immediately
      try {
        const snapshotEvt = new CustomEvent<LedgerRefreshDetail>(SNAPSHOT_EVENT_NAME, {
          detail: { address: address || null, snapshotBalance },
        });
        window.dispatchEvent(snapshotEvt);
      } catch (e) {
        // no-op
      }

      this.queue.push({ address, snapshotBalance, resolve });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const item = this.queue.shift();
    
    if (item) {
      // Wait for blockchain to propagate the balance change (3 seconds for full settlement)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Dispatch the refresh event with polling flag
      try {
        const evt = new CustomEvent<LedgerRefreshDetail>(EVENT_NAME, {
          detail: { 
            address: item.address || null,
            snapshotBalance: item.snapshotBalance,
            shouldPollUntilStable: true, // Always poll for actions
          },
        });
        window.dispatchEvent(evt);
      } catch (e) {
        // no-op
      }
      
      // Wait a short time to ensure the refresh completes before next item
      await new Promise((resolve) => setTimeout(resolve, 500));
      item.resolve();
    }
    
    this.processing = false;
    
    // Process next item if any
    if (this.queue.length > 0) {
      this.process();
    }
  }
}

const refreshQueue = new RefreshQueue();

// Store to track current balances per address
const balanceStore = new Map<string, string>();

export function setCurrentBalance(address: string, balance: string) {
  balanceStore.set(address.toLowerCase(), balance);
}

export function getCurrentBalance(address: string): string | null {
  return balanceStore.get(address.toLowerCase()) || null;
}

export function triggerLedgerRefresh(address?: string | null, snapshotBalance?: string | null) {
  // If no snapshot provided, try to get from store
  const snapshot = snapshotBalance || (address ? getCurrentBalance(address) : null);
  console.log('[ledgerRefresh] triggerLedgerRefresh called:', {
    address,
    providedSnapshot: snapshotBalance,
    storeSnapshot: address ? getCurrentBalance(address) : null,
    finalSnapshot: snapshot
  });
  return refreshQueue.add(address, snapshot);
}

export function useLedgerRefresh(handler: (detail: LedgerRefreshDetail) => void) {
  useEffect(() => {
    const onEvt = (e: Event) => {
      const ce = e as CustomEvent<LedgerRefreshDetail>;
      handler(ce.detail || {});
    };
    window.addEventListener(EVENT_NAME, onEvt as EventListener);
    return () => window.removeEventListener(EVENT_NAME, onEvt as EventListener);
  }, [handler]);
}

export function useLedgerSnapshot(handler: (detail: LedgerRefreshDetail) => void) {
  useEffect(() => {
    const onEvt = (e: Event) => {
      const ce = e as CustomEvent<LedgerRefreshDetail>;
      handler(ce.detail || {});
    };
    window.addEventListener(SNAPSHOT_EVENT_NAME, onEvt as EventListener);
    return () => window.removeEventListener(SNAPSHOT_EVENT_NAME, onEvt as EventListener);
  }, [handler]);
}


