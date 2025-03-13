import { InvalidArgumentException } from '@lit-protocol/constants';
import { logger } from '@lit-protocol/logger';

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

/**
 * Convert this format:
 * {"lit-ratelimitincrease://25364":{"Auth/Auth":[{"nft_id":["25364"]}]}}
 * to human-readable format
 */
function humanReadableAtt(obj: any, indentLevel: number = 0): string {
  const indent = ' '.repeat(indentLevel * 2);
  let result = '';

  for (const key in obj) {
    result += `${indent}* ${key}\n`;

    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      result += humanReadableAtt(obj[key], indentLevel + 1);
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach((item: any) => {
        if (typeof item === 'object') {
          result += humanReadableAtt(item, indentLevel + 1);
        } else {
          result += `${indent}  * ${item}\n`;
        }
      });
    } else {
      result += `${indent}  * ${obj[key]}\n`;
    }
  }
  return result;
}

export function formatSessionSigs(
  sessionSigs: string,
  currentTime: Date = new Date()
): string {
  const parsedSigs = JSON.parse(sessionSigs);
  const firstNodeKey = Object.keys(parsedSigs)[0];
  const firstNode = parsedSigs[firstNodeKey];
  let signedMessage;

  try {
    signedMessage = JSON.parse(firstNode.signedMessage);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new InvalidArgumentException(
      {
        info: {
          signedMessage,
          firstNodeSignedMessage: firstNode.signedMessage,
        },
      },
      `Invalid JSON format for signedMessage: ${errorMessage}`
    );
  }

  const currentDate = new Date(currentTime);

  let result = `The request time is at: ${currentDate.toISOString()}\n`;

  // Outer expiration
  let issuedAt, expiration;
  try {
    issuedAt = new Date(signedMessage.issuedAt);
    expiration = new Date(signedMessage.expiration);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new InvalidArgumentException(
      {
        info: {
          signedMessage,
        },
      },
      `Error parsing issuedAt or expiration: ${errorMessage}`
    );
  }

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
    let attenuation: string = '';

    try {
      const encodedRecap = (parsedCapMessage['- urn'] as string)?.split(':')[1];
      const decodedRecap = atob(encodedRecap);
      const jsonRecap = JSON.parse(decodedRecap);
      attenuation = humanReadableAtt(jsonRecap.att, 6);
    } catch (e) {
      // swallow error
      logger.info({
        function: 'formatSessionSigs',
        msg: 'Error parsing attenuation',
        error: e,
      });
    }

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
    result += `        * Attenuation:\n`;
    result += attenuation;
  });
  return result;
}
