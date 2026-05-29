import { NextFunction, Request, Response } from 'express';
import Logger from '../config/logger';
import { resolveRequestId } from '../utils/requestId';

const LOG = new Logger('requestLogger');

const formatRequestLog = (
  requestId: string,
  req: Request,
  res: Response,
  durationMs: number,
): string => {
  return [
    'HTTP request completed',
    `requestId=${requestId}`,
    `method=${req.method}`,
    `path=${req.originalUrl}`,
    `statusCode=${res.statusCode}`,
    `durationMs=${durationMs}`,
  ].join(' ');
};

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startedAt = Date.now();
  const requestId = req.requestId ?? resolveRequestId(req.get('x-request-id'));

  if (!req.requestId) {
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
  }

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const message = formatRequestLog(requestId, req, res, durationMs);

    if (res.statusCode >= 500) {
      LOG.error(message);
    } else if (res.statusCode >= 400) {
      LOG.warn(message);
    } else {
      LOG.info(message);
    }
  });

  next();
};

export default requestLogger;
