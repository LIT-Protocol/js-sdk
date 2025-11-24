/**
 * TransactionToastContainer Component
 * 
 * Displays transaction notifications with links to block explorer
 */

import React from 'react';
import { TransactionToast } from '../../types';
import { formatTxHash } from '../../utils';

interface TransactionToastContainerProps {
  toasts: TransactionToast[];
  onRemoveToast: (id: string) => void;
}

export const TransactionToastContainer: React.FC<TransactionToastContainerProps> = ({ 
  toasts, 
  onRemoveToast 
}) => (
  <div className="fixed z-[10000] flex flex-col gap-3 max-w-[90vw] sm:max-w-[420px] right-3 sm:right-6 top-3 sm:top-6">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-4 py-3 rounded-lg text-sm font-medium shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3`}
      >
        <div className="flex-1 min-w-0">
          <div className="mb-1 truncate">
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
          <div className="text-[11px] opacity-90 font-mono truncate">
            <a
              href={`https://yellowstone-explorer.litprotocol.com/tx/${toast.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline opacity-90"
            >
              Tx: {formatTxHash(toast.txHash)}
            </a>
          </div>
        </div>
        <button
          onClick={() => onRemoveToast(toast.id)}
          className="bg-transparent border-0 text-white text-base cursor-pointer p-1 rounded hover:bg-white/10"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
); 