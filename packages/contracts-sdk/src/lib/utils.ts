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
  const now = new Date();
  const futureDate = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysFromNow
  );
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
      // Convert requests per day to requests per kilosecond
      // Divide the total requests by kiloseconds in a day to get requests per kilosecond
      return requests / kilosecondsPerDay;
    case 'second':
      // Convert requests per second to requests per kilosecond
      // Since 1 kilosecond = 1000 seconds, multiplying requests by kilosecondsPerSecond
      // actually divides the number of requests by 1000, converting to requests per kilosecond
      return requests / 1000;
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
      // Convert requests per second to requests per day
      return requests * secondsPerDay;
    case 'kilosecond':
      // Convert requests per kilosecond to requests per day
      // First convert kiloseconds to seconds (1 kilosecond = 1000 seconds), then multiply by seconds in a day
      return requests * 1000 * (secondsPerDay / 1000);
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
      // Convert requests per day to requests per second
      return requests / secondsPerDay;
    case 'kilosecond':
      // Convert requests per kilosecond to requests per second
      // Since 1 kilosecond = 1000 seconds, this is a direct conversion
      return requests * 1000;
    default:
      throw new Error('Invalid period');
  }
}
