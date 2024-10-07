import { parseSignedMessage } from './session-sigs-validator';

function formatDuration(start: Date, end: Date): string {
  const diff = end.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = ((diff % (1000 * 60)) / 1000).toFixed(3);


  let elapsedTime: string;

  if (days > 0) {
    elapsedTime = `${days} days`;
  } else if (hours > 0) {
    elapsedTime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  } else {
    elapsedTime = `${minutes} minutes, ${seconds} seconds`;
  }

  return elapsedTime;
}

function formatStatus(expirationDate: Date, currentDate: Date): string {
  if (expirationDate > currentDate) {
    const timeLeft = formatDuration(currentDate, expirationDate);
    return `✅ Not expired (valid for ${timeLeft})`;
  } else {
    const timeAgo = formatDuration(expirationDate, currentDate);
    return `❌ Expired (expired ${timeAgo} ago)`;
  }
}

export function formatSessionSigs(
  sessionSigs: string,
  currentTime: Date = new Date()
): string {
  const parsedSigs = JSON.parse(sessionSigs);
  const firstNodeKey = Object.keys(parsedSigs)[0];
  const firstNode = parsedSigs[firstNodeKey];
  const signedMessage = JSON.parse(firstNode.signedMessage);

  const currentDate = new Date(currentTime);

  let result = `The request time is at: ${currentDate.toISOString()}\n`;

  // Outer expiration
  const issuedAt = new Date(signedMessage.issuedAt);
  const expiration = new Date(signedMessage.expiration);

  result += '* Outer expiration:\n';
  result += `    * Issued at: ${issuedAt.toISOString()}\n`;
  result += `    * Expiration: ${expiration.toISOString()}\n`;
  result += `    * Duration: ${formatDuration(issuedAt, expiration)}\n`;
  result += `    * Status: ${formatStatus(expiration, currentDate)}\n`;

  // Capabilities
  result += '* Capabilities:\n';
  signedMessage.capabilities.forEach((cap: any, index: number) => {
    const capType = cap.derivedVia;
    const parsedCapMessage = parseSignedMessage(cap.signedMessage);

    const capIssuedAt = new Date(parsedCapMessage['Issued At'] || '');
    const capExpiration = new Date(parsedCapMessage['Expiration Time'] || '');

    result += `    * Capability ${index + 1} (${capType}):\n`;
    result += `        * Issued at: ${capIssuedAt.toISOString()}\n`;
    result += `        * Expiration: ${capExpiration.toISOString()}\n`;
    result += `        * Duration: ${formatDuration(
      capIssuedAt,
      capExpiration
    )}\n`;
    result += `        * Status: ${formatStatus(capExpiration, currentDate)}\n`;
  });

  return result;
}
