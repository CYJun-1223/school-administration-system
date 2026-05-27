import multer from 'multer';
import type { Response } from 'express';
import CsvUploadError from '../../errors/CsvUploadError';
import csvUploadMiddleware from '../csvUpload';
import upload from '../../config/multer';

jest.mock('../../config/multer', () => ({
  __esModule: true,
  default: {
    single: jest.fn(() => jest.fn()),
  },
}));

const mockedUpload = upload as unknown as {
  single: jest.Mock;
};

const getUploadHandler = (): jest.Mock => {
  return mockedUpload.single.mock.results[0].value as jest.Mock;
};

describe('csvUploadMiddleware', () => {
  beforeEach(() => {
    const handler = getUploadHandler();
    handler.mockReset();
  });

  it('translates multer file size errors into CsvUploadError', async () => {
    const handler = getUploadHandler();
    handler.mockImplementation(
      (_req: unknown, _res: unknown, callback: (error?: unknown) => void) => {
        callback(new multer.MulterError('LIMIT_FILE_SIZE'));
      },
    );

    const req = {} as unknown;
    const res = {} as Response;
    const next = jest.fn();

    csvUploadMiddleware(req as never, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(CsvUploadError);
    expect((next.mock.calls[0][0] as CsvUploadError).getMessage()).toContain(
      'CSV file must be',
    );
  });

  it('passes through non-multer errors', async () => {
    const handler = getUploadHandler();
    const error = new Error('boom');

    handler.mockImplementation(
      (_req: unknown, _res: unknown, callback: (error?: unknown) => void) => {
        callback(error);
      },
    );

    const req = {} as unknown;
    const res = {} as Response;
    const next = jest.fn();

    csvUploadMiddleware(req as never, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBe(error);
  });

  it('calls next without an error when upload succeeds', async () => {
    const handler = getUploadHandler();
    handler.mockImplementation(
      (_req: unknown, _res: unknown, callback: (error?: unknown) => void) => {
        callback(null);
      },
    );

    const req = {} as unknown;
    const res = {} as Response;
    const next = jest.fn();

    csvUploadMiddleware(req as never, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]).toEqual([]);
  });
});
