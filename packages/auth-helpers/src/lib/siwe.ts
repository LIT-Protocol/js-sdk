export function sanitizeSiweMessage(message: string): string {
  // Unescape double-escaped newlines
  let sanitizedMessage = message.replace(/\\\\n/g, '\\n');

  // Replace escaped double quotes with single quotes
  sanitizedMessage = sanitizedMessage.replace(/\\"/g, "'");

  return sanitizedMessage;
}
