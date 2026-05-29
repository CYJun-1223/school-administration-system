import type { Request, Response } from 'express';
import { getRequestId } from '../../utils/requestContext';
import requestContext from '../requestContext';

describe('requestContext', () => {
  it('exposes the request id from request id middleware through async local storage', () => {
    const req = {
      get: jest.fn((header: string) =>
        header === 'x-request-id' ? 'incoming-request-id' : undefined,
      ),
      requestId: 'incoming-request-id',
    } as unknown as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn(() => {
      expect(getRequestId()).toBe('incoming-request-id');
    });

    requestContext(req, res, next);

    expect(req.requestId).toBe('incoming-request-id');
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a request id when the client does not provide one', () => {
    const req = {
      get: jest.fn(() => undefined),
    } as unknown as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn(() => {
      expect(getRequestId()).toMatch(/^[0-9a-f]{32}$/);
    });

    requestContext(req, res, next);

    expect(req.requestId).toMatch(/^[0-9a-f]{32}$/);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      expect.stringMatching(/^[0-9a-f]{32}$/),
    );
  });
});
