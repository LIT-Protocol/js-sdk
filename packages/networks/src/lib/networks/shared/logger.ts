import { pino } from 'pino';
import pinoCaller from 'pino-caller';

const baseLogger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: true },
  },
});

export const logger = pinoCaller(baseLogger as any);
