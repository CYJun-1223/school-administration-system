import fs from 'fs';
import multer from 'multer';
import type { Request } from 'express';
import Logger from './logger';
import { MAX_CSV_UPLOAD_BYTES } from '../const/CsvUpload';
import CsvUploadError from '../errors/CsvUploadError';

const LOG = new Logger('multer.js');
const uploadDirectory = '/tmp/school-administration-system-uploads';

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: uploadDirectory,
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_CSV_UPLOAD_BYTES,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback) => {
    const originalName = file.originalname.toLowerCase();
    const isCsvFile = originalName.endsWith('.csv');

    if (!isCsvFile) {
      LOG.warn('Rejected CSV upload', {
        fileName: file.originalname,
        mimeType: file.mimetype,
        reason: 'invalid-file-extension',
      });

      callback(CsvUploadError.invalidFileExtension());

      return;
    }

    callback(null, true);
  },
});

export default upload;
