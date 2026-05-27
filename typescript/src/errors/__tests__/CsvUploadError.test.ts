import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ErrorCodes from '../../const/ErrorCodes';
import { MAX_CSV_UPLOAD_BYTES } from '../../const/CsvUpload';
import CsvUploadError from '../CsvUploadError';

describe('CsvUploadError', () => {
  it('creates a validation error for invalid file extensions', () => {
    const error = CsvUploadError.invalidFileExtension();

    expect(error).toBeInstanceOf(CsvUploadError);
    expect(error.getMessage()).toBe('Only CSV uploads are allowed');
    expect(error.getErrorCode()).toBe(ErrorCodes.INVALID_CSV_ERROR_CODE);
    expect(error.getHttpStatusCode()).toBe(StatusCodes.BAD_REQUEST);
  });

  it('maps file size multer errors to a clear message', () => {
    const error = CsvUploadError.fromMulterError(
      new multer.MulterError('LIMIT_FILE_SIZE'),
    );

    expect(error.getMessage()).toBe(
      `CSV file must be ${MAX_CSV_UPLOAD_BYTES} bytes or less`,
    );
    expect(error.getErrorCode()).toBe(ErrorCodes.INVALID_CSV_ERROR_CODE);
    expect(error.getHttpStatusCode()).toBe(StatusCodes.BAD_REQUEST);
  });

  it('maps other multer errors to a generic csv upload error', () => {
    const error = CsvUploadError.fromMulterError(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE'),
    );

    expect(error.getMessage()).toBe('Invalid CSV upload');
    expect(error.getErrorCode()).toBe(ErrorCodes.INVALID_CSV_ERROR_CODE);
    expect(error.getHttpStatusCode()).toBe(StatusCodes.BAD_REQUEST);
  });
});
