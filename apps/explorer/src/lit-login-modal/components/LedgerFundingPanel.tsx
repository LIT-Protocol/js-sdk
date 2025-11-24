import type { ReactNode } from "react";

interface LedgerFundingPanelProps {
  pkpAddress: string;
  networkName: string;
  faucetUrl: string;
  children?: ReactNode;
}

export const LedgerFundingPanel: React.FC<LedgerFundingPanelProps> = ({
  pkpAddress,
  networkName,
  faucetUrl,
  children,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded border border-gray-200 bg-[#f9fafb] text-black">
        <div className="text-[13px] mb-1 font-medium">PKP Address</div>
        <div className="text-[12px] font-mono break-all">{pkpAddress}</div>
        <p className="text-[12px] text-gray-600 mt-2 mb-0">
          Fund this address on <strong>{networkName}</strong> to continue.
        </p>
      </div>

      <div className="p-3 rounded border border-dashed border-amber-200 bg-amber-50 text-amber-900 text-[13px] leading-snug">
        <p className="m-0 mb-2">
          On test networks you can use the Lit faucet to top up your Lit Ledger
          balance quickly.
        </p>
        <a
          href={faucetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-600 text-white text-[12px] font-semibold cursor-pointer hover:bg-amber-500 transition-colors"
        >
          Open Faucet
        </a>
      </div>

      {children && (
        <div className="pt-2 border-t border-gray-200">{children}</div>
      )}
    </div>
  );
};
