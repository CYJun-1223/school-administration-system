import { NextFunction, Request, Response } from 'express';
import Logger from '../config/logger';
import { resolveRequestId } from '../utils/requestId';

const LOG = new Logger('requestLogger');

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startedAt = Date.now();
  const requestId = req.requestId ?? resolveRequestId(req.get('x-request-id'));

  if (!req.requestId) {
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
  }

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    LOG[level]('HTTP request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
};

export default requestLogger;
