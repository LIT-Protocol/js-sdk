import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "@/Header";

import { APP_INFO } from "./_config";
import { LitAuthProvider } from "./lit-login-modal/LitAuthProvider";
import PKPSelectionSection from "./lit-login-modal/PKPSelectionSection";
import { LedgerFundingPanel } from "./lit-login-modal/components/LedgerFundingPanel";

interface ErrorDisplayProps {
  error: string | null;
  isVisible: boolean;
  onClear: () => void;
}

const ErrorDisplay = ({ error, isVisible, onClear }: ErrorDisplayProps) => {
  if (!error || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-[450px] min-w-[300px] p-5 bg-rose-50 border-2 border-rose-300 border-l-4 border-l-red-600 rounded-lg shadow-2xl animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="text-2xl text-red-600 leading-none animate-pulse-shadow">
          ❌
        </div>
        <div className="flex-1">
          <h4 className="m-0 mb-2 text-red-700 text-base font-bold uppercase tracking-wide">
            Error
          </h4>
          <div className="text-red-900 text-sm leading-6 font-mono whitespace-pre-wrap break-words bg-rose-200 p-2.5 rounded border border-rose-300">
            {error}
          </div>
        </div>
        <button
          onClick={onClear}
          title="Close error"
          className="bg-red-600 hover:bg-red-700 border-0 text-white text-sm cursor-pointer px-2 py-1.5 rounded font-bold transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const HomePage = () => {
  // Error state management
  const [error, setError] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false);

  // Function to clear error
  const clearError = () => {
    setError(null);
    setIsErrorVisible(false);
  };

  return (
    <LitAuthProvider
      appName="lit-auth-modal-demo"
      supportedNetworks={["naga-dev", "naga-test", "naga-proto", "naga"]}
      defaultNetwork="naga-dev"
      enabledAuthMethods={[
        "eoa",
        "google",
        "discord",
        "webauthn",
        "stytch-email",
        "stytch-sms",
        "stytch-whatsapp",
        "stytch-totp",
      ]}
      services={{
        authServiceUrls: APP_INFO.authServiceUrls,
        authServiceApiKey: APP_INFO.litAuthServerApiKey,
        loginServerUrl: APP_INFO.litLoginServer,
        discordClientId: APP_INFO.discordClientId,
      }}
      features={{ funding: true, settings: true, persistSettings: true }}
      components={{
        PkpSelection: PKPSelectionSection,
        FundingPanel: LedgerFundingPanel,
      }}
      faucetUrl={`${APP_INFO.faucetUrl}?action=combined&ledgerPercent=80`}
      defaultPrivateKey={APP_INFO.defaultPrivateKey}
      persistUser={false}
      closeOnBackdropClick={false}
      showNetworkMessage={true}
    >
      {/* ---------- Header ---------- */}
      <Header />

      {/* ---------- Main Content ---------- */}
      <main className="content">
        <ErrorDisplay
          error={error}
          isVisible={isErrorVisible}
          onClear={clearError}
        />
        <Outlet />
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} {APP_INFO.copyright}
        </p>
      </footer>
    </LitAuthProvider>
  );
};

export default HomePage;
