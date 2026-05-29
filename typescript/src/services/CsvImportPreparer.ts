import ErrorCodes from '../const/ErrorCodes';
import Logger from '../config/logger';
import { CsvItem } from '../types/CsvItem';
import {
  ClassRecord,
  CsvImportData,
  CsvStudentClassRelation,
  StudentRecord,
  SubjectRecord,
  TeacherRecord,
} from '../types/Domain';
import { csvItemSchema } from '../validation/schemas/CsvItemSchema';
import { validate } from '../validation/validate';

const LOG = new Logger('CsvImportPreparer.js');

const isBlankRow = (row: CsvItem): boolean => {
  const values = Object.values(row).map((value) => (value ?? '').trim());
  return values.every((value) => value.length === 0);
};

const setAndWarnIfDifferent = <T extends Record<string, unknown>>(
  map: Map<string, T>,
  key: string,
  value: T,
  label: string,
): void => {
  const existing = map.get(key);
  if (existing) {
    const changed = Object.keys(value).some((k) => existing[k] !== value[k]);
    if (changed) {
      LOG.warn('Duplicate entry overwritten', {
        label,
        key,
        old: existing,
        new: value,
      });
    }
  }
  map.set(key, value);
};

export const prepareCsvImport = (rows: CsvItem[]): CsvImportData => {
  const teacherMap = new Map<string, TeacherRecord>();
  const studentMap = new Map<string, StudentRecord>();
  const classMap = new Map<string, ClassRecord>();
  const subjectMap = new Map<string, SubjectRecord>();
  const studentClassMap = new Map<string, CsvStudentClassRelation>();
  const teacherClassSubjectMap = new Map<
    string,
    { teacherEmail: string; classCode: string; subjectCode: string }
  >();

  rows.forEach((row, index) => {
    if (isBlankRow(row)) {
      return;
    }

    const {
      teacherEmail,
      teacherName,
      studentEmail,
      studentName,
      classCode,
      classname,
      subjectCode,
      subjectName,
      toDelete,
    } = validate<CsvItem>(csvItemSchema, row, {
      errorCode: ErrorCodes.INVALID_CSV_ERROR_CODE,
      fallbackMessage: `Invalid CSV row at line ${index + 1}`,
    });

    const active = toDelete === '0';

    setAndWarnIfDifferent(teacherMap, teacherEmail, {
      email: teacherEmail,
      name: teacherName,
    }, 'teacher');
    setAndWarnIfDifferent(studentMap, studentEmail, {
      email: studentEmail,
      name: studentName,
    }, 'student');
    setAndWarnIfDifferent(classMap, classCode, {
      code: classCode,
      name: classname,
    }, 'class');
    setAndWarnIfDifferent(subjectMap, subjectCode, {
      code: subjectCode,
      name: subjectName,
    }, 'subject');

    studentClassMap.set(`${studentEmail}::${classCode}`, {
      studentEmail,
      classCode,
      active,
    });

    teacherClassSubjectMap.set(
      `${teacherEmail}::${classCode}::${subjectCode}`,
      {
        teacherEmail,
        classCode,
        subjectCode,
      },
    );
  });

  return {
    teachers: Array.from(teacherMap.values()),
    students: Array.from(studentMap.values()),
    classes: Array.from(classMap.values()),
    subjects: Array.from(subjectMap.values()),
    studentClassRelations: Array.from(studentClassMap.values()),
    teacherClassSubjectRelations: Array.from(teacherClassSubjectMap.values()),
  };
};
