import {
  ExternalStudentRecord,
  LocalStudentRecord,
  StudentListingRecord,
  StudentListResponse,
} from '../types/Domain';

const compareStudents = (
  left: Pick<StudentListingRecord, 'name' | 'email' | 'id'>,
  right: Pick<StudentListingRecord, 'name' | 'email' | 'id'>,
): number => {
  const nameComparison = left.name.localeCompare(right.name, undefined, {
    sensitivity: 'base',
  });
  if (nameComparison !== 0) {
    return nameComparison;
  }

  const emailComparison = left.email.localeCompare(right.email, undefined, {
    sensitivity: 'base',
  });
  if (emailComparison !== 0) {
    return emailComparison;
  }

  return left.id - right.id;
};

export const toInternalStudentRecord = (
  student: LocalStudentRecord,
): StudentListingRecord => ({
  id: student.id,
  name: student.name,
  email: student.email,
  isExternal: false,
});

export const toExternalStudentRecord = (
  student: ExternalStudentRecord,
): StudentListingRecord => ({
  id: student.id,
  name: student.name,
  email: student.email,
  isExternal: true,
});

export const mergeAndPaginateStudents = (
  localStudents: StudentListingRecord[],
  externalStudents: StudentListingRecord[],
  offset: number,
  limit: number,
): StudentListResponse => {
  const merged = [...localStudents, ...externalStudents].sort(compareStudents);

  return {
    count: merged.length,
    students: merged.slice(offset, offset + limit),
  };
};
