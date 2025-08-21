/**
 * Creates a unique request ID for tracking requests
 */
export function createRequestId(): string {
  return `request_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
