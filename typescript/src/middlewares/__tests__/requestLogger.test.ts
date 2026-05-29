import { EventEmitter } from 'events';
import type { Request, Response } from 'express';
import Logger from '../../config/logger';
import requestLogger from '../requestLogger';

const infoSpy = jest.spyOn(Logger.prototype, 'info');
const warnSpy = jest.spyOn(Logger.prototype, 'warn');
const errorSpy = jest.spyOn(Logger.prototype, 'error');

const createResponse = (statusCode = 200): Response & EventEmitter & {
  setHeader: jest.Mock;
} => {
  return Object.assign(new EventEmitter(), {
    statusCode,
    setHeader: jest.fn(),
  }) as Response & EventEmitter & {
    setHeader: jest.Mock;
  };
};

describe('requestLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs the completed request with the request id from context middleware', () => {
    const req = {
      get: jest.fn((header: string) =>
        header === 'x-request-id' ? 'incoming-request-id' : undefined,
      ),
      method: 'GET',
      originalUrl: '/health',
      requestId: 'incoming-request-id',
    } as unknown as Request;
    const res = createResponse(200);
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(req.requestId).toBe('incoming-request-id');
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.listenerCount('finish')).toBe(1);
    expect(next).toHaveBeenCalledTimes(1);

    res.emit('finish');

    expect(infoSpy).toHaveBeenCalledWith('HTTP request completed', {
      requestId: 'incoming-request-id',
      method: 'GET',
      path: '/health',
      statusCode: 200,
      durationMs: expect.any(Number),
    });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('generates a request id when the client does not provide one', () => {
    const req = {
      get: jest.fn(() => undefined),
      method: 'POST',
      originalUrl: '/api/classes',
    } as unknown as Request;
    const res = createResponse(500);
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(req.requestId).toMatch(/^[0-9a-f]{32}$/);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      expect.stringMatching(/^[0-9a-f]{32}$/),
    );

    res.emit('finish');

    expect(errorSpy).toHaveBeenCalledWith('HTTP request completed', {
      requestId: expect.stringMatching(/^[0-9a-f]{32}$/),
      method: 'POST',
      path: '/api/classes',
      statusCode: 500,
      durationMs: expect.any(Number),
    });
  });
});
