import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import csvUploadMiddleware from '../middlewares/csvUpload';
import csvUploadValidationMiddleware from '../middlewares/csvUploadValidation';

const DataImportController = Express.Router();
const LOG = new Logger('DataImportController.js');

// TODO: Please implement Question 1 requirement here
const dataImportHandler: RequestHandler = async (req, res) => {
  const data = req.validatedCsvRows ?? [];

  LOG.info(JSON.stringify(data, null, 2));

  return res.sendStatus(StatusCodes.NO_CONTENT);
}

DataImportController.post(
  '/upload',
  csvUploadMiddleware,
  csvUploadValidationMiddleware,
  dataImportHandler,
);

export default DataImportController;
