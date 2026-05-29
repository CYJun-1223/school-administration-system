import { StatusCodes } from 'http-status-codes';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';
import { getRequestId } from '../utils/requestContext';
import Logger from './logger';
import type { ErrorRequestHandler } from 'express';

const LOG = new Logger('globalErrorHandler');

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.requestId ?? getRequestId();

  // Handling of body-parser content malformed error
  if (err.type === 'entity.parse.failed') {
    LOG.warn('Malformed JSON request', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
    });

    return res.status(StatusCodes.BAD_REQUEST).send({
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
      message: 'Malformed json',
    });
  }

  if (err instanceof ErrorBase) {
    const error = err;
    const statusCode = error.getHttpStatusCode();

    if (statusCode === StatusCodes.BAD_REQUEST) {
      LOG.warn('Request validation failed', {
        requestId,
        path: req.originalUrl,
        errorCode: error.getErrorCode(),
        details: error.getMessage(),
      });
    }

    return res.status(statusCode).send({
      errorCode: error.getErrorCode(),
      message: error.getMessage()
    });
  }

  const error = err as Error & { message?: string; stack?: string };
  const stack = process.env.NODE_ENV === 'production' ? undefined : error?.stack;
  LOG.error('Unexpected error', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    errorType: error?.name ?? typeof err,
    details: error?.message || 'Internal Server Error',
    stack,
  });

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    errorCode: ErrorCodes.RUNTIME_ERROR_CODE,
    message: 'Internal Server Error',
  });
};

export default globalErrorHandler;
