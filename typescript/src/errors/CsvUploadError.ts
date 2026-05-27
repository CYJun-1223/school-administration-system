import { StatusCodes } from 'http-status-codes';
import type { MulterError } from 'multer';
import ErrorCodes from '../const/ErrorCodes';
import { MAX_CSV_UPLOAD_BYTES } from '../const/CsvUpload';
import ErrorBase from './ErrorBase';

class CsvUploadError extends ErrorBase {
  constructor(message: string) {
    super(message, ErrorCodes.INVALID_CSV_ERROR_CODE, StatusCodes.BAD_REQUEST);

    Object.setPrototypeOf(this, CsvUploadError.prototype);
  }

  public static invalidFileExtension(): CsvUploadError {
    return new CsvUploadError('Only CSV uploads are allowed');
  }

  public static fromMulterError(error: MulterError): CsvUploadError {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `CSV file must be ${MAX_CSV_UPLOAD_BYTES} bytes or less`
        : 'Invalid CSV upload';

    return new CsvUploadError(message);
  }
}

export default CsvUploadError;
