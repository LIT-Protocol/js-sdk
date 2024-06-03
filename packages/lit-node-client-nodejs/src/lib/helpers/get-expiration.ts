/**
 * Returns the expiration date and time as an ISO string.
 * The expiration is set to 24 hours from the current date and time.
 *
 * @returns {string} The expiration date and time as an ISO string.
 */
export const getExpiration = () => {
  return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
};
