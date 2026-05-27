import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import ErrorBase from '../errors/ErrorBase';
import ErrorCodes from '../const/ErrorCodes';
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

const EXTERNAL_STUDENT_SERVICE_URL =
  process.env.EXTERNAL_STUDENT_SERVICE_URL ?? 'http://localhost:5000';

const buildExternalStudentsUrl = (): string => {
  return `${EXTERNAL_STUDENT_SERVICE_URL.replace(/\/$/, '')}/students`;
};

export const countExternalStudentsByClassCode = async (
  classCode: string,
): Promise<number> => {
  try {
    const response = await axios.get<ExternalStudentApiResponse>(
      buildExternalStudentsUrl(),
      {
        params: {
          class: classCode,
          offset: 0,
          limit: 0,
        },
      },
    );

    return Number(response.data.count ?? 0);
  } catch (error) {
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

  const listResponse = await axios.get<ExternalStudentApiResponse>(
    buildExternalStudentsUrl(),
    {
      params: {
        class: classCode,
        offset: 0,
        limit: count,
      },
    },
  );

  return (listResponse.data.students ?? []).map(toExternalStudentRecord);
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
