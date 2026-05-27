import multer from 'multer';
import type { RequestHandler } from 'express';
import upload from '../config/multer';
import CsvUploadError from '../errors/CsvUploadError';

const csvUploadSingle = upload.single('data');

const csvUploadMiddleware: RequestHandler = (req, res, next) => {
  csvUploadSingle(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      return next(CsvUploadError.fromMulterError(error));
    }

    if (error) {
      return next(error);
    }

    return next();
  });
};

export default csvUploadMiddleware;
