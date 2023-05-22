export function sanitizeSiweMessage(message: string): string {
  // replace all escaped double quotes with single quotes.
  return message.replace(/\"/g, "'");
}
