import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import ErrorBase from '../errors/ErrorBase';
import ErrorCodes from '../const/ErrorCodes';
import { getRequestId } from '../utils/requestContext';
import {
  countLocalStudentsByClassCode,
  getLocalStudentsByClassCode,
} from '../repositories/ClassRepository';
import {
  ExternalStudentRecord,
  StudentListResponse,
  StudentListingRecord,
} from '../types/Domain';
import {
  mergeAndPaginateStudents,
  toExternalStudentRecord,
  toInternalStudentRecord,
} from './StudentListingHelpers';

interface ExternalStudentApiResponse {
  count: number;
  students: ExternalStudentRecord[];
}

const LOG = new Logger('StudentListingService.js');

const EXTERNAL_STUDENT_SERVICE_URL =
  process.env.EXTERNAL_STUDENT_SERVICE_URL ?? 'http://localhost:5000';

const buildExternalStudentsUrl = (): string => {
  return `${EXTERNAL_STUDENT_SERVICE_URL.replace(/\/$/, '')}/students`;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const countExternalStudentsByClassCode = async (
  classCode: string,
): Promise<number> => {
  const startedAt = Date.now();
  const endpoint = buildExternalStudentsUrl();

  try {
    const response = await axios.get<ExternalStudentApiResponse>(
      endpoint,
      {
        params: {
          class: classCode,
          offset: 0,
          limit: 0,
        },
      },
    );

    const count = Number(response.data.count ?? 0);
    LOG.info('External student API count completed', {
      requestId: getRequestId(),
      classCode,
      endpoint,
      offset: 0,
      limit: 0,
      durationMs: Date.now() - startedAt,
      count,
    });

    return count;
  } catch (error) {
    LOG.warn('External student API count failed', {
      requestId: getRequestId(),
      classCode,
      endpoint,
      offset: 0,
      limit: 0,
      durationMs: Date.now() - startedAt,
      error: getErrorMessage(error),
    });
    throw new ErrorBase(
      'Unable to fetch external students',
      ErrorCodes.EXTERNAL_SERVICE_ERROR_CODE,
      StatusCodes.BAD_GATEWAY,
    );
  }
};

const fetchAllExternalStudents = async (
  classCode: string,
): Promise<StudentListingRecord[]> => {
  const count = await countExternalStudentsByClassCode(classCode);
  if (count === 0) {
    return [];
  }

  const startedAt = Date.now();
  const endpoint = buildExternalStudentsUrl();

  try {
    const listResponse = await axios.get<ExternalStudentApiResponse>(
      endpoint,
      {
        params: {
          class: classCode,
          offset: 0,
          limit: count,
        },
      },
    );

    const students = (listResponse.data.students ?? []).map(toExternalStudentRecord);
    LOG.info('External student API list completed', {
      requestId: getRequestId(),
      classCode,
      endpoint,
      offset: 0,
      limit: count,
      durationMs: Date.now() - startedAt,
      recordsReturned: students.length,
    });

    return students;
  } catch (error) {
    LOG.warn('External student API list failed', {
      requestId: getRequestId(),
      classCode,
      endpoint,
      offset: 0,
      limit: count,
      durationMs: Date.now() - startedAt,
      error: getErrorMessage(error),
    });
    throw error;
  }
};

export const getClassStudents = async (
  classCode: string,
  offset: number,
  limit: number,
): Promise<StudentListResponse> => {
  const [localCount, localStudents] = await Promise.all([
    countLocalStudentsByClassCode(classCode),
    getLocalStudentsByClassCode(classCode),
  ]);

  let externalStudents: StudentListingRecord[];
  try {
    externalStudents = await fetchAllExternalStudents(classCode);
  } catch (error) {
    throw new ErrorBase(
      'Unable to fetch external students',
      ErrorCodes.EXTERNAL_SERVICE_ERROR_CODE,
      StatusCodes.BAD_GATEWAY,
    );
  }

  const combinedLocalStudents = localStudents.map(toInternalStudentRecord);
  const merged = mergeAndPaginateStudents(
    combinedLocalStudents,
    externalStudents,
    offset,
    limit,
  );

  return {
    count: localCount + externalStudents.length,
    students: merged.students,
  };
};
