import { APP_INFO } from "@/_config";

import { UIPKP, BalanceInfo } from "../../types";
import { PKPInfoCard } from "../pkp/PKPInfoCard";

import type { FC, ReactNode } from "react";

interface DashboardContentProps {
  selectedPkp: UIPKP | null;
  balance: BalanceInfo | null;
  isLoadingBalance: boolean;
  selectedChain: string;
  onShowPkpModal: () => void;
  onChainChange: (chain: string) => void;
  userMethod: string;
  children: ReactNode;
}

export const DashboardContent: FC<DashboardContentProps> = ({
  selectedPkp,
  balance,
  isLoadingBalance,
  selectedChain,
  onShowPkpModal,
  onChainChange,
  userMethod,
  children,
}) => {
  return (
    <div className="bg-[#FAFAFA] text-black z-0">
      <div className="h-6 sm:h-8"></div>
      <div className="max-w-8xl m-auto px-4 sm:px-6 lg:px-12">
        <aside
          className="hidden lg:block z-20 fixed bottom-0 right-auto w-[18rem] h-full pt-6 lg:pt-8"
          style={{ top: "calc(7rem + 38px)" }}
        >
          {/* Faucet Information */}
          {/* <div className="text-sm p-2.5 bg-[#e8f4fd] rounded border border-[#b3d9ff]">
            <strong>💰 Need Test Tokens?</strong> Visit{" "}
            <a
              href={APP_INFO.faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066cc] underline"
            >
              Chronicle Yellowstone Faucet
            </a>{" "}
          </div> */}

          <PKPInfoCard
            selectedPkp={selectedPkp}
            balance={balance}
            isLoadingBalance={isLoadingBalance}
            onShowPkpModal={onShowPkpModal}
            userMethod={userMethod}
            selectedChain={selectedChain}
            onChainChange={onChainChange}
          />

          {/* Reference */}
          <h5 className="mt-5 text-sm font-medium mb-3">Resources</h5>

          <ul id="sidebar-group">
            <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
              <a
                className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                href="https://chronicle-yellowstone-faucet.getlit.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-1 flex items-center space-x-2.5">
                  <div className="text-sm">Faucet (test tokens)</div>
                </div>
              </a>
            </li>

            <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
              <a
                className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                href="https://hub.conduit.xyz/chronicle-yellowstone-testnet-9qgmzfcohk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-1 flex items-center space-x-2.5">
                  <div className="text-sm">Private RPC URL</div>
                </div>
              </a>
            </li>

            <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
              <a
                className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                href="https://yellowstone-explorer.litprotocol.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-1 flex items-center space-x-2.5">
                  <div className="text-sm">Testnet Explorer</div>
                </div>
              </a>
            </li>

            <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
              <a
                className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                href={APP_INFO.nagaLitActionsDocs}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-1 flex items-center space-x-2.5">
                  <div className="text-sm">LitActions API Docs</div>
                </div>
              </a>
            </li>

            <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
              <a
                className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                href="https://naga.developer.litprotocol.com/sdk/introduction/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-1 flex items-center space-x-2.5">
                  <div className="text-sm">Naga SDK Docs</div>
                </div>
              </a>
            </li>

            {/* Highlighted Style */}
            {/* <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
              <a
                className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl  bg-[#FDEEE6] text-[#EA580D] font-semibold"
                style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                href="https://chronicle-yellowstone-faucet.getlit.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-1 flex items-center space-x-2.5">
                  <div className="text-sm">Faucet</div>
                </div>
              </a>
            </li> */}
          </ul>
        </aside>
        <main className="relative grow box-border flex-col w-full mx-auto px-1 lg:pl-[23.7rem] lg:-ml-12">
          {children}
        </main>
      </div>
    </div>
  );
};
