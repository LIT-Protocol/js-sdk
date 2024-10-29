/**
 * Interface representing a FROST share with hex string values (without 0x prefix)
 */
export interface FrostShare {
  /** Hex string identifier without 0x prefix */
  identifierHex: string;
  /** Hex string hiding nonce without 0x prefix */
  hidingNonceHex: string;
  /** Hex string binding nonce without 0x prefix */
  bindingNonceHex: string;
  /** Hex string signature share without 0x prefix */
  signatureShareHex: string;
  /** Hex string verifying share without 0x prefix */
  verifyingShareHex: string;
}

/**
 * Interface representing FROST data with hex string values (without 0x prefix)
 */
export interface FrostData {
  /** Hex string message without 0x prefix */
  messageHex: string;
  /** Hex string public key without 0x prefix */
  publicKeyHex: string;
  /** Array of FROST shares */
  shares: FrostShare[];
  /** Hex string signature without 0x prefix */
  signatureHex: string;
}