import { LIT_NETWORK } from '@lit-protocol/constants';
import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';

// Converts the number of requests per day to requests per second.
export function convertRequestsPerDayToPerSecond(
  requestsPerDay: number
): number {
  const secondsInADay = 86400; // 24 hours * 60 minutes * 60 seconds
  return requestsPerDay / secondsInADay;
}

// Calculates the expiration timestamp in UTC for a given number of days from now.
// The expiration time is set to midnight (00:00:00) UTC of the target day.
export function calculateUTCMidnightExpiration(daysFromNow: number): number {
  // Create a Date object for the current time in UTC
  const now = new Date();
  const utcNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  // Create a future Date object in UTC, adding the specified number of days
  const futureDate = new Date(utcNow);
  futureDate.setUTCDate(futureDate.getUTCDate() + daysFromNow);
  futureDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC

  return Math.floor(futureDate.getTime() / 1000);
}

export function requestsToKilosecond({
  period,
  requests,
}: {
  period: 'day' | 'second';
  requests: number;
}) {
  const secondsPerDay = 86400; // Total seconds in a day
  const kilosecondsPerDay = secondsPerDay / 1000; // Convert seconds in a day to kiloseconds

  switch (period) {
    case 'day':
      return Math.round(requests / kilosecondsPerDay);
    case 'second':
      return Math.round(requests * 1000);
    default:
      throw new Error('Invalid period');
  }
}

export function requestsToDay({
  period,
  requests,
}: {
  period: 'second' | 'kilosecond';
  requests: number;
}): number {
  const secondsPerDay = 86400; // Total seconds in a day

  switch (period) {
    case 'second':
      return Math.round(requests * secondsPerDay);
    case 'kilosecond':
      return Math.round(requests * 86);
    default:
      throw new Error('Invalid period');
  }
}

export function requestsToSecond({
  period,
  requests,
}: {
  period: 'day' | 'kilosecond';
  requests: number;
}): number {
  const secondsPerDay = 86400; // Total seconds in a day

  switch (period) {
    case 'day':
      return Math.round(requests / secondsPerDay);
    case 'kilosecond':
      return Math.round(requests * 1000);
    default:
      throw new Error('Invalid period');
  }
}

export function determineProtocol(
  port: number,
  network: LIT_NETWORKS_KEYS
): string {
  const HTTP = 'http://';
  const HTTPS = 'https://';

  // Standard HTTPS port
  const HTTPS_PORT = 443;

  // Custom HTTPS port range for centralised 3 nodes test networks (e.g., cayenne, datil-dev)
  // We should respect https on these ports as they are using trusted ZeroSSL certs
  const CUSTOM_HTTPS_PORT_START = 8470;
  const CUSTOM_HTTPS_PORT_END = 8479;

  // Always use HTTP for localhost and custom networks
  if (network === LIT_NETWORK.Localhost || network === LIT_NETWORK.Custom) {
    return HTTP;
  }

  // For Cayenne & Datil Networks network, use HTTPS for the standard HTTPS port or the custom port range
  if (network === LIT_NETWORK.Cayenne) {
    return port === HTTPS_PORT ||
      (port >= CUSTOM_HTTPS_PORT_START && port <= CUSTOM_HTTPS_PORT_END)
      ? HTTPS
      : HTTP;
  }

  // For all other networks, use HTTPS for the standard HTTPS port or any other port
  return HTTPS;
}
