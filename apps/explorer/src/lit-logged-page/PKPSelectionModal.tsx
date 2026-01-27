/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitServices } from "@/hooks/useLitServiceSetup";
import { PKPData } from "@lit-protocol/schemas";

import PKPSelectionSection from "../lit-login-modal/PKPSelectionSection";

import type { FC } from "react";

/**
 * PKPSelectionModal
 *
 * A reusable modal component that displays the PKP selection flow.
 *
 * Usage:
 * <PKPSelectionModal
 *   isOpen={boolean}
 *   onClose={() => void}
 *   authData={any}
 *   authMethodName={string}
 *   services={{ litClient: any; authManager: any } | null}
 *   disabled={boolean}
 *   authServiceBaseUrl={string}
 *   onPkpSelected={(pkpInfo: PkpInfo) => void}
 * />
 */

// Configurable constants
const MODAL_Z_INDEX = 1000;

export interface PKPSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  authData: any;
  authMethodName: string;
  services: LitServices;
  disabled?: boolean;
  authServiceBaseUrl: string;
  onPkpSelected: (pkpInfo: PKPData) => void;
}

const PKPSelectionModal: FC<PKPSelectionModalProps> = ({
  isOpen,
  onClose,
  authData,
  authMethodName,
  services,
  disabled = false,
  authServiceBaseUrl,
  onPkpSelected,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-5 z-[${MODAL_Z_INDEX}]`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white text-black rounded-xl p-5 sm:p-7 w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 max-w-[92vw] sm:max-w-md md:max-w-lg lg:max-w-3xl">
        <div className="mb-5">
          <button
            onClick={onClose}
            className="text-gray-500 text-[13px] mb-3 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            ← Close
          </button>
        </div>

        <PKPSelectionSection
          authData={authData}
          onPkpSelected={onPkpSelected}
          authMethodName={authMethodName}
          services={services}
          disabled={disabled}
          authServiceBaseUrl={authServiceBaseUrl}
        />
      </div>
    </div>
  );
};

export default PKPSelectionModal;
