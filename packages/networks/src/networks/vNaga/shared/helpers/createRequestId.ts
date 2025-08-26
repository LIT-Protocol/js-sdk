/**
 * Creates a unique request ID for tracking requests
 */
export function createRequestId(): string {
  return `lit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
