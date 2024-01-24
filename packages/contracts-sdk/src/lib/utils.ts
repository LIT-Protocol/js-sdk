// Converts the number of requests per day to requests per second.
export function convertRequestsPerDayToPerSecond(requestsPerDay: number): number {
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

// Utility function to calculate requests per kilosecond
export function calculateRequestsPerKilosecond(requestsPerSecond: number): number {
  return requestsPerSecond * 1000;
}