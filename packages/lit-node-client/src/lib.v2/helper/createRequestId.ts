export const createRequestId = () => {
  return Math.random().toString(16).slice(2);
};
