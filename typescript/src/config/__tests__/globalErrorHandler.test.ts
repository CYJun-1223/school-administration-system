import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';
import ErrorCodes from '../../const/ErrorCodes';
import ErrorBase from '../../errors/ErrorBase';
import globalErrorHandler from '../globalErrorHandler';

const createResponse = (): Response => {
  return {
    headersSent: false,
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;
};

describe('globalErrorHandler', () => {
  it('maps malformed json errors to a friendly response', () => {
    const res = createResponse();
    const next = jest.fn();

    globalErrorHandler(
      { type: 'entity.parse.failed' } as never,
      {} as Request,
      res,
      next,
    );

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
    expect(next).not.toHaveBeenCalled();
  });

  it('returns a generic runtime error for unknown failures', () => {
    const res = createResponse();
    const next = jest.fn();
    const error = new Error('boom');

    globalErrorHandler(error, {} as Request, res, next);

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
