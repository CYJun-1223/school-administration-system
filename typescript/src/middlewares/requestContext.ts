import { NextFunction, Request, Response } from 'express';
import { runWithRequestContext } from '../utils/requestContext';
import { resolveRequestId } from '../utils/requestId';

const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.requestId ?? resolveRequestId(req.get('x-request-id'));

  if (!req.requestId) {
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
  }

  runWithRequestContext({ requestId }, next);
};

export default requestContext;
