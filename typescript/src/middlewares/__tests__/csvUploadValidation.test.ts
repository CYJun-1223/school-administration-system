import fs from 'fs/promises';
import type { Response } from 'express';
import ErrorBase from '../../errors/ErrorBase';
import { convertCsvToJson } from '../../utils';
import csvUploadValidationMiddleware from '../csvUploadValidation';
import type { CsvItem } from '../../types/CsvItem';
import type { ValidatedRequest } from '../../types/ValidatedRequest';

jest.mock('../../config/logger', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn(),
    log: jest.fn(),
  })),
}));

jest.mock('../../utils', () => ({
  convertCsvToJson: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

const mockedConvertCsvToJson = convertCsvToJson as jest.MockedFunction<
  typeof convertCsvToJson
>;
const mockedUnlink = fs.unlink as jest.MockedFunction<typeof fs.unlink>;

describe('csvUploadValidationMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates uploaded rows and stores them on the request', async () => {
    const rows: CsvItem[] = [
      {
        teacherEmail: 'teacher1@gmail.com',
        teacherName: 'Teacher 1',
        studentEmail: 'student1@gmail.com',
        studentName: 'Student 1',
        classCode: 'P1-1',
        classname: 'P1 Integrity',
        subjectCode: 'MATHS',
        subjectName: 'Mathematics',
        toDelete: '0',
      },
    ];

    mockedConvertCsvToJson.mockResolvedValue(rows);

    const req = {
      file: {
        path: '/tmp/upload.csv',
        originalname: 'upload.csv',
        mimetype: 'text/csv',
        size: 1234,
      },
    } as ValidatedRequest<CsvItem[]>;
    const res = {} as Response;
    const next = jest.fn();

    await csvUploadValidationMiddleware(req, res, next);

    expect(mockedConvertCsvToJson).toHaveBeenCalledWith('/tmp/upload.csv');
    expect(req.validated).toEqual(rows);
    expect(mockedUnlink).toHaveBeenCalledWith('/tmp/upload.csv');
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]).toEqual([]);
  });

  it('passes row validation failures to next and still removes the temp file', async () => {
    mockedConvertCsvToJson.mockResolvedValue([
      {
        teacherEmail: '',
        teacherName: 'Teacher 1',
        studentEmail: 'student1@gmail.com',
        studentName: 'Student 1',
        classCode: 'P1-1',
        classname: 'P1 Integrity',
        subjectCode: 'MATHS',
        subjectName: 'Mathematics',
        toDelete: '0',
      },
    ]);

    const req = {
      file: {
        path: '/tmp/upload.csv',
        originalname: 'upload.csv',
        mimetype: 'text/csv',
        size: 1234,
      },
    } as ValidatedRequest<CsvItem[]>;
    const res = {} as Response;
    const next = jest.fn();

    await csvUploadValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ErrorBase);
    expect(mockedUnlink).toHaveBeenCalledWith('/tmp/upload.csv');
  });

  it('rejects requests without an uploaded file', async () => {
    const req = {} as ValidatedRequest<CsvItem[]>;
    const res = {} as Response;
    const next = jest.fn();

    await csvUploadValidationMiddleware(req, res, next);

    expect(mockedConvertCsvToJson).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ErrorBase);
    expect(mockedUnlink).not.toHaveBeenCalled();
  });
});
