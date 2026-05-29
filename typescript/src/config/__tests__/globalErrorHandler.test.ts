import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';
import Logger from '../logger';
import ErrorCodes from '../../const/ErrorCodes';
import ErrorBase from '../../errors/ErrorBase';
import { runWithRequestContext } from '../../utils/requestContext';
import globalErrorHandler from '../globalErrorHandler';

const errorSpy = jest.spyOn(Logger.prototype, 'error');
const warnSpy = jest.spyOn(Logger.prototype, 'warn');

const createResponse = (): Response => {
  return {
    headersSent: false,
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;
};

describe('globalErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps malformed json errors to a friendly response', () => {
    const res = createResponse();
    const next = jest.fn();
    const req = {
      requestId: 'request-123',
      method: 'POST',
      originalUrl: '/api/classes',
    } as Request;

    globalErrorHandler(
      { type: 'entity.parse.failed' } as never,
      req,
      res,
      next,
    );

    expect(warnSpy).toHaveBeenCalledWith('Malformed JSON request', {
      requestId: 'request-123',
      method: 'POST',
      path: '/api/classes',
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
      message: 'Malformed json',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('serializes ErrorBase responses with their configured status and code', () => {
    const res = createResponse();
    const next = jest.fn();
    const error = new ErrorBase('Class not found', 123, StatusCodes.NOT_FOUND);

    globalErrorHandler(error, {} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith({
      errorCode: 123,
      message: 'Class not found',
    });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('logs validation failures as warnings', () => {
    const res = createResponse();
    const next = jest.fn();
    const req = {
      requestId: 'request-123',
      originalUrl: '/api/classes/P1-1/students',
    } as Request;
    const error = new ErrorBase(
      'Invalid request',
      ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      StatusCodes.BAD_REQUEST,
    );

    runWithRequestContext({ requestId: 'request-123' }, () => {
      globalErrorHandler(error, req, res, next);
    });

    expect(warnSpy).toHaveBeenCalledWith('Request validation failed', {
      requestId: 'request-123',
      path: '/api/classes/P1-1/students',
      errorCode: ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      details: 'Invalid request',
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      errorCode: ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      message: 'Invalid request',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns a generic runtime error for unknown failures', () => {
    const res = createResponse();
    const next = jest.fn();
    const req = {
      requestId: 'request-123',
      method: 'POST',
      originalUrl: '/api/classes',
    } as Request;
    const error = new Error('boom');

    runWithRequestContext({ requestId: 'request-123' }, () => {
      globalErrorHandler(error, req, res, next);
    });

    expect(errorSpy).toHaveBeenCalledWith('Unexpected error', {
      requestId: 'request-123',
      method: 'POST',
      path: '/api/classes',
      errorType: 'Error',
      details: 'boom',
      stack: expect.stringMatching(/^Error: boom/),
    });

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith({
      errorCode: ErrorCodes.RUNTIME_ERROR_CODE,
      message: 'Internal Server Error',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('delegates to next when headers have already been sent', () => {
    const res = createResponse();
    res.headersSent = true;
    const next = jest.fn();
    const error = new Error('boom');

    globalErrorHandler(error, {} as Request, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
