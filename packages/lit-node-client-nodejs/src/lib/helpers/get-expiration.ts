/**
 * Get expiration for session default time is 1 day / 24 hours
 */
export const getExpiration = () => {
  return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
};
