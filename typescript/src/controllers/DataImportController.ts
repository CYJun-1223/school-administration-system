import Express from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import csvUploadMiddleware from '../middlewares/csvUpload';
import csvUploadValidationMiddleware from '../middlewares/csvUploadValidation';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';
import { importCsvRows } from '../services/ImportService';
import { prepareCsvImport } from '../services/CsvImportPreparer';
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

  let uploadedFileName: string | undefined;
  let importSummary: ImportSummary | undefined;
  let completionStatus: 'success' | 'failure' = 'success';

  try {
    const data = req.validated;

    if (!data) {
      throw new ErrorBase(
        'Validated CSV rows are missing',
        ErrorCodes.RUNTIME_ERROR_CODE,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    uploadedFileName = req.file?.originalname;

    LOG.info(
      `Accepted CSV upload file originalName=${uploadedFileName ?? 'missing'} mimetype=${req.file?.mimetype ?? 'missing'} size=${req.file?.size ?? 0} bytes`,
    );
    LOG.debug(
      `Validated CSV rows originalName=${uploadedFileName ?? 'missing'} rowCount=${data.length}`,
    );

    const importData = prepareCsvImport(data);
    importSummary = {
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

    LOG.debug(
      `Validated CSV rows originalName=${uploadedFileName ?? 'missing'} rowCount=${data.length}`,
    );
    LOG.info(
      `Import summary summary=${JSON.stringify(importSummary)}`,
    );
    LOG.info(
      `Importing CSV rows originalName=${uploadedFileName ?? 'missing'} rowCount=${data.length}`,
    );

    await importCsvRows(importData);
    LOG.info(
      `Imported CSV rows originalName=${uploadedFileName ?? 'missing'} rowCount=${data.length}`,
    );

    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    completionStatus = 'failure';
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof ErrorBase && error.getHttpStatusCode() < 500) {
      LOG.warn(
        `CSV upload rejected method=${req.method} path=${req.originalUrl} file=${uploadedFileName ?? 'missing'} reason=${errorMessage}`,
      );
    } else {
      LOG.error(
        `CSV upload failed method=${req.method} path=${req.originalUrl} file=${uploadedFileName ?? 'missing'} error=${errorMessage}`,
      );
    }

    next(error);
  } finally {
    const durationMs = Date.now() - startedAt;
    LOG.info(
      `CSV upload completed status=${completionStatus} durationMs=${durationMs} file=${uploadedFileName ?? 'missing'} summary=${importSummary ? JSON.stringify(importSummary) : 'unavailable'}`,
    );
  }
};
DataImportController.post(
  '/upload',
  csvUploadMiddleware,
  csvUploadValidationMiddleware,
  dataImportHandler,
);

export default DataImportController;
