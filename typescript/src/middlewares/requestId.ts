import { NextFunction, Request, Response } from 'express';
import { resolveRequestId } from '../utils/requestId';

const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const resolvedRequestId = resolveRequestId(req.get('x-request-id'));

  req.requestId = resolvedRequestId;
  res.setHeader('X-Request-ID', resolvedRequestId);

  next();
};

export default requestId;
