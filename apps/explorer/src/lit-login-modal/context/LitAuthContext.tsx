import { createContext, useContext } from "react";
import type { LitAuthContextValue } from "../types";

export const LitAuthContext = createContext<LitAuthContextValue | null>(null);

export const useLitAuth = () => {
  const context = useContext(LitAuthContext);
  if (!context) {
    throw new Error("useLitAuth must be used within a LitAuthProvider");
  }
  return context;
};

export const useOptionalLitAuth = () => useContext(LitAuthContext);
