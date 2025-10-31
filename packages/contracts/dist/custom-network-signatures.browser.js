/**
 * Browser stub for @lit-protocol/contracts/custom-network-signatures.
 * These utilities require Node.js filesystem access and cannot run in the browser.
 */
const UNSUPPORTED_MESSAGE = "@lit-protocol/contracts/custom-network-signatures is not supported in browser environments. Please pre-generate contract signatures in a Node.js process and ship the artifacts instead.";
function throwBrowserUnsupported() {
  throw new Error(UNSUPPORTED_MESSAGE);
}
function buildSignaturesFromContext(_options) {
  return throwBrowserUnsupported();
}
async function generateSignaturesFromContext(_options) {
  throwBrowserUnsupported();
}
export {
  buildSignaturesFromContext,
  generateSignaturesFromContext
};
