// Compatibility env shim for existing imports
export const env = {
  NETWORK: process.env['NETWORK'] || 'naga-dev',
  LIT_TXSENDER_RPC_URL: process.env['LIT_TXSENDER_RPC_URL'] || '',
  LIT_TXSENDER_PRIVATE_KEY: process.env['LIT_TXSENDER_PRIVATE_KEY'] || '',
  REDIS_URL: process.env['REDIS_URL'] || 'redis://localhost:6379',
  AUTH_SERVER_PORT: Number(process.env['AUTH_SERVER_PORT'] || 3000),
  AUTH_SERVER_HOST: process.env['AUTH_SERVER_HOST'] || '0.0.0.0',
  ENABLE_API_KEY_GATE: process.env['ENABLE_API_KEY_GATE'] === 'true',
  LOGIN_SERVER_PORT: Number(process.env['LOGIN_SERVER_PORT'] || 3300),
  LOGIN_SERVER_HOST: process.env['LOGIN_SERVER_HOST'] || '0.0.0.0',
};
