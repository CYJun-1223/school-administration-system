import fs from 'fs/promises';
import type { NextFunction, Response } from 'express';
import Logger from '../config/logger';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';
import { convertCsvToJson } from '../utils';
import { validate } from '../validation/validate';
import { csvItemSchema } from '../validation/schemas/CsvItemSchema';
import { csvUploadFileSchema } from '../validation/schemas/CsvUploadFileSchema';
import type { CsvItem } from '../types/CsvItem';
import type { ValidatedRequest } from '../types/ValidatedRequest';

const LOG = new Logger('csvUploadValidation.js');

const cleanupTempFile = async (filePath: string | undefined): Promise<void> => {
  if (!filePath) {
    return;
  }

  await fs.unlink(filePath).catch((err) => {
    LOG.warn('Unable to remove temporary CSV file', {
      filePath,
      error: String(err),
    });
  });
};

type CsvUploadValidationRequest = ValidatedRequest<CsvItem[]>;

const csvUploadValidationMiddleware = async (
  req: CsvUploadValidationRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const uploadedFilePath = req.file?.path;
  const uploadedFileName = req.file?.originalname;

  try {
    const file = validate<{
      path: string;
      originalname: string;
      mimetype: string;
      size: number;
    }>(csvUploadFileSchema, req.file, {
      errorCode: ErrorCodes.INVALID_CSV_ERROR_CODE,
      fallbackMessage: 'CSV file is required',
    });

    const rows = await convertCsvToJson(file.path);

    await cleanupTempFile(uploadedFilePath);

    rows.forEach((row, index) =>
      validate(csvItemSchema, row, {
        errorCode: ErrorCodes.INVALID_CSV_ERROR_CODE,
        fallbackMessage: `Invalid CSV row at line ${index + 1}`,
      }),
    );

    req.validated = rows;

    next();
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof ErrorBase && error.getHttpStatusCode() < 500) {
      LOG.warn('CSV upload validation rejected', {
        file: uploadedFileName ?? 'missing',
        reason: errorMessage,
      });
    } else {
      LOG.error('CSV upload validation failed', {
        file: uploadedFileName ?? 'missing',
        error: errorMessage,
      });
    }

    await cleanupTempFile(uploadedFilePath);
    next(error);
  }
};

export default csvUploadValidationMiddleware;
