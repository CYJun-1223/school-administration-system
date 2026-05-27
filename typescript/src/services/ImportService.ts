import sequelize from '../config/database';
import { Transaction } from 'sequelize';
import { StatusCodes } from 'http-status-codes';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';
import {
  deactivateStudentClass,
  upsertStudentClass,
} from '../repositories/StudentClassRepository';
import { upsertStudent } from '../repositories/StudentRepository';
import {
  getLocalStudentsByClassCode,
  upsertClass,
} from '../repositories/ClassRepository';
import { upsertTeacherClassSubject } from '../repositories/TeacherClassSubjectRepository';
import { upsertSubject } from '../repositories/SubjectRepository';
import { upsertTeacher } from '../repositories/TeacherRepository';
import { countExternalStudentsByClassCode } from './StudentListingService';
import {
  CsvImportData,
  CsvStudentClassRelation,
  LocalStudentRecord,
} from '../types/Domain';

const MAX_STUDENTS_PER_CLASS = 500;

const assertFound = <T>(value: T | undefined, message: string): T => {
  if (value === undefined || value === null) {
    throw new Error(message);
  }

  return value;
};

const compareClassCodes = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { sensitivity: 'base' });

const getClassCodes = (classes: Array<{ code: string }>): string[] => {
  return classes.map((schoolClass) => schoolClass.code).sort(compareClassCodes);
};

const calculateFinalLocalStudentCount = (
  currentStudents: LocalStudentRecord[],
  relations: CsvStudentClassRelation[],
): number => {
  const activeStudentEmails = new Set(currentStudents.map((student) => student.email));

  for (const relation of relations) {
    if (relation.active) {
      activeStudentEmails.add(relation.studentEmail);
    } else {
      activeStudentEmails.delete(relation.studentEmail);
    }
  }

  return activeStudentEmails.size;
};

const buildExternalStudentCountMap = async (
  classCodes: string[],
): Promise<Map<string, number>> => {
  const entries = await Promise.all(
    classCodes.map(async (classCode) => {
      const count = await countExternalStudentsByClassCode(classCode);
      return [classCode, count] as const;
    }),
  );

  return new Map(entries);
};

const assertClassCapacities = async (
  classCodes: string[],
  studentClassRelations: CsvStudentClassRelation[],
  externalStudentCounts: Map<string, number>,
  transaction?: Transaction,
): Promise<void> => {
  for (const classCode of classCodes) {
    const currentLocalStudents = await getLocalStudentsByClassCode(
      classCode,
      transaction,
    );
    const classRelations = studentClassRelations.filter(
      (relation) => relation.classCode === classCode,
    );
    const finalLocalStudentCount = calculateFinalLocalStudentCount(
      currentLocalStudents,
      classRelations,
    );
    const combinedStudentCount =
      finalLocalStudentCount + (externalStudentCounts.get(classCode) ?? 0);

    if (combinedStudentCount > MAX_STUDENTS_PER_CLASS) {
      throw new ErrorBase(
        `Class ${classCode} cannot have more than ${MAX_STUDENTS_PER_CLASS} students`,
        ErrorCodes.INVALID_REQUEST_ERROR_CODE,
        StatusCodes.BAD_REQUEST,
      );
    }
  }
};

export const importCsvRows = async (
  importData: CsvImportData,
): Promise<void> => {
  const classCodes = getClassCodes(importData.classes);
  const externalStudentCounts = await buildExternalStudentCountMap(classCodes);

  await assertClassCapacities(
    classCodes,
    importData.studentClassRelations,
    externalStudentCounts,
  );
  await sequelize.transaction(async (transaction) => {
    const teacherIds = new Map<string, number>();
    const studentIds = new Map<string, number>();
    const classIds = new Map<string, number>();
    const subjectIds = new Map<string, number>();

    for (const schoolClass of importData.classes) {
      const classId = await upsertClass(
        schoolClass.code,
        schoolClass.name,
        transaction,
      );
      classIds.set(schoolClass.code, classId);
    }

    await assertClassCapacities(
      classCodes,
      importData.studentClassRelations,
      externalStudentCounts,
      transaction,
    );

    for (const teacher of importData.teachers) {
      const teacherId = await upsertTeacher(
        teacher.email,
        teacher.name,
        transaction,
      );
      teacherIds.set(teacher.email, teacherId);
    }

    for (const student of importData.students) {
      const studentId = await upsertStudent(
        student.email,
        student.name,
        transaction,
      );
      studentIds.set(student.email, studentId);
    }

    for (const subject of importData.subjects) {
      const subjectId = await upsertSubject(
        subject.code,
        subject.name,
        transaction,
      );
      subjectIds.set(subject.code, subjectId);
    }

    for (const classCode of classCodes) {
      const classRelations = importData.studentClassRelations.filter(
        (relation) => relation.classCode === classCode,
      );

      for (const relation of classRelations) {
        const studentId = assertFound(
          studentIds.get(relation.studentEmail),
          `Missing student id for ${relation.studentEmail}`,
        );
        const classId = assertFound(
          classIds.get(relation.classCode),
          `Missing class id for ${relation.classCode}`,
        );

        if (relation.active) {
          await upsertStudentClass(studentId, classId, transaction);
        } else {
          await deactivateStudentClass(studentId, classId, transaction);
        }
      }
    }

    for (const relation of importData.teacherClassSubjectRelations) {
      const teacherId = assertFound(
        teacherIds.get(relation.teacherEmail),
        `Missing teacher id for ${relation.teacherEmail}`,
      );
      const classId = assertFound(
        classIds.get(relation.classCode),
        `Missing class id for ${relation.classCode}`,
      );
      const subjectId = assertFound(
        subjectIds.get(relation.subjectCode),
        `Missing subject id for ${relation.subjectCode}`,
      );

      await upsertTeacherClassSubject(teacherId, subjectId, classId, transaction);
    }
  });
};
