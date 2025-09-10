import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { createLoginApp } from './app';
import { logger } from '../auth-server/src/providers/logger';

const port = Number(process.env['LOGIN_SERVER_PORT'] || 3300);
const host = process.env['LOGIN_SERVER_HOST'] || '0.0.0.0';
const origin = process.env['ORIGIN'] || `http://localhost:${port}`;

const app = createLoginApp(origin);
const server = createServer(app);

server.listen(port, host, () => {
  const { address, port: p } = server.address() as AddressInfo;
  logger.info(`Login Server listening on http://${address}:${p}`);
});
