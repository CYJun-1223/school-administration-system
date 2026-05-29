import Express from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import csvUploadMiddleware from '../middlewares/csvUpload';
import csvUploadValidationMiddleware from '../middlewares/csvUploadValidation';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';
import { importCsvRows } from '../services/ImportService';
import { prepareCsvImport } from '../services/CsvImportPreparer';
import { getRequestId } from '../utils/requestContext';
import type { CsvItem } from '../types/CsvItem';
import type { ValidatedRequest } from '../types/ValidatedRequest';
import type { RequestHandler } from 'express';

const DataImportController = Express.Router();
const LOG = new Logger('DataImportController.js');

type ImportSummary = {
  rowCount: number;
  teacherCount: number;
  studentCount: number;
  classCount: number;
  subjectCount: number;
  studentRelationCount: number;
  activeStudentRelationCount: number;
  inactiveStudentRelationCount: number;
  teacherClassSubjectRelationCount: number;
};

const dataImportHandler: RequestHandler = async (
  req: ValidatedRequest<CsvItem[]>,
  res,
  next,
) => {
  const startedAt = Date.now();
  const requestId = getRequestId();

  try {
    const data = req.validated;

    if (!data) {
      throw new ErrorBase(
        'Validated CSV rows are missing',
        ErrorCodes.RUNTIME_ERROR_CODE,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const importData = prepareCsvImport(data);
    const importSummary: ImportSummary = {
      rowCount: data.length,
      teacherCount: importData.teachers.length,
      studentCount: importData.students.length,
      classCount: importData.classes.length,
      subjectCount: importData.subjects.length,
      studentRelationCount: importData.studentClassRelations.length,
      activeStudentRelationCount: importData.studentClassRelations.filter(
        (relation) => relation.active,
      ).length,
      inactiveStudentRelationCount: importData.studentClassRelations.filter(
        (relation) => !relation.active,
      ).length,
      teacherClassSubjectRelationCount:
        importData.teacherClassSubjectRelations.length,
    };

    await importCsvRows(importData);

    LOG.info('CSV import completed', {
      requestId,
      originalName: req.file?.originalname ?? 'missing',
      mimetype: req.file?.mimetype ?? 'missing',
      size: req.file?.size ?? 0,
      durationMs: Date.now() - startedAt,
      ...importSummary,
    });

    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};
DataImportController.post(
  '/upload',
  csvUploadMiddleware,
  csvUploadValidationMiddleware,
  dataImportHandler,
);

export default DataImportController;
