import { getChildLogger } from '@lit-protocol/logger';
import type { Request, Response, NextFunction } from 'express';

export const logger = getChildLogger({ module: 'auth-services' });

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      { method: req.method, url: req.originalUrl, ip: req.ip },
      'HTTP request'
    );
  } catch {}
  next();
};
