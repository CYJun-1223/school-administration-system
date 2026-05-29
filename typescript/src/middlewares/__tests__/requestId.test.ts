import type { Request, Response } from 'express';
import requestId from '../requestId';

describe('requestId', () => {
  it('attaches the incoming request id and response header', () => {
    const req = {
      get: jest.fn((header: string) =>
        header === 'x-request-id' ? 'incoming-request-id' : undefined,
      ),
    } as unknown as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.requestId).toBe('incoming-request-id');
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      'incoming-request-id',
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a request id when the client does not provide one', () => {
    const req = {
      get: jest.fn(() => undefined),
    } as unknown as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.requestId).toMatch(/^[0-9a-f]{32}$/);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      expect.stringMatching(/^[0-9a-f]{32}$/),
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
