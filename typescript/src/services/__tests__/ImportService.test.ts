import sequelize from '../../config/database';
import { CsvItem } from '../../types/CsvItem';
import { importCsvRows } from '../ImportService';
import { prepareCsvImport } from '../CsvImportPreparer';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(async (callback: (transaction: unknown) => Promise<unknown>) => {
      return callback({} as never);
    }),
  },
}));

jest.mock('../../repositories/StudentClassRepository', () => ({
  upsertStudentClass: jest.fn().mockResolvedValue(undefined),
  deactivateStudentClass: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../repositories/StudentRepository', () => ({
  upsertStudent: jest.fn(),
}));

jest.mock('../../repositories/ClassRepository', () => ({
  upsertClass: jest.fn(),
  getLocalStudentsByClassCode: jest.fn(),
}));

jest.mock('../../repositories/TeacherRepository', () => ({
  upsertTeacher: jest.fn(),
}));

jest.mock('../../repositories/SubjectRepository', () => ({
  upsertSubject: jest.fn(),
}));

jest.mock('../../repositories/TeacherClassSubjectRepository', () => ({
  upsertTeacherClassSubject: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../StudentListingService', () => ({
  countExternalStudentsByClassCode: jest.fn(),
}));

const mockedSequelize = sequelize as unknown as {
  transaction: jest.Mock;
};

import {
  upsertTeacher,
} from '../../repositories/TeacherRepository';
import {
  upsertStudent,
} from '../../repositories/StudentRepository';
import {
  upsertClass,
  getLocalStudentsByClassCode,
} from '../../repositories/ClassRepository';
import {
  upsertSubject,
} from '../../repositories/SubjectRepository';
import {
  upsertStudentClass,
  deactivateStudentClass,
} from '../../repositories/StudentClassRepository';
import {
  upsertTeacherClassSubject,
} from '../../repositories/TeacherClassSubjectRepository';
import {
  countExternalStudentsByClassCode,
} from '../StudentListingService';

const mockedUpsertTeacher = upsertTeacher as jest.Mock;
const mockedUpsertStudent = upsertStudent as jest.Mock;
const mockedUpsertClass = upsertClass as jest.Mock;
const mockedUpsertSubject = upsertSubject as jest.Mock;
const mockedUpsertStudentClass = upsertStudentClass as jest.Mock;
const mockedDeactivateStudentClass = deactivateStudentClass as jest.Mock;
const mockedUpsertTeacherClassSubject = upsertTeacherClassSubject as jest.Mock;
const mockedGetLocalStudentsByClassCode = getLocalStudentsByClassCode as jest.Mock;
const mockedCountExternalStudentsByClassCode = countExternalStudentsByClassCode as jest.Mock;

describe('importCsvRows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts entities in one transaction and applies the final relation state', async () => {
    const rows: CsvItem[] = [
      {
        teacherEmail: 'teacher1@gmail.com',
        teacherName: 'Teacher Old',
        studentEmail: 'student1@gmail.com',
        studentName: 'Student Old',
        classCode: 'P1-1',
        classname: 'P1 Integrity',
        subjectCode: 'MATHS',
        subjectName: 'Mathematics',
        toDelete: '0',
      },
      {
        teacherEmail: 'teacher1@gmail.com',
        teacherName: 'Teacher New',
        studentEmail: 'student1@gmail.com',
        studentName: 'Student New',
        classCode: 'P1-1',
        classname: 'P1 Integrity Updated',
        subjectCode: 'MATHS',
        subjectName: 'Mathematics Updated',
        toDelete: '1',
      },
      {
        teacherEmail: 'teacher2@gmail.com',
        teacherName: 'Teacher Two',
        studentEmail: 'student2@gmail.com',
        studentName: 'Student Two',
        classCode: 'P2-1',
        classname: 'P2 Integrity',
        subjectCode: 'SCI',
        subjectName: 'Science',
        toDelete: '0',
      },
    ];

    mockedUpsertTeacher
      .mockResolvedValueOnce(101)
      .mockResolvedValueOnce(102);
    mockedUpsertStudent
      .mockResolvedValueOnce(201)
      .mockResolvedValueOnce(202);
    mockedUpsertClass
      .mockResolvedValueOnce(301)
      .mockResolvedValueOnce(302);
    mockedUpsertSubject
      .mockResolvedValueOnce(401)
      .mockResolvedValueOnce(402);
    mockedGetLocalStudentsByClassCode
      .mockResolvedValueOnce([
        { id: 201, name: 'Student Old', email: 'student1@gmail.com' },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 201, name: 'Student Old', email: 'student1@gmail.com' },
      ])
      .mockResolvedValueOnce([]);
    mockedCountExternalStudentsByClassCode
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const importData = prepareCsvImport(rows);
    await importCsvRows(importData);

    expect(mockedSequelize.transaction).toHaveBeenCalledTimes(1);
    expect(mockedUpsertTeacher).toHaveBeenNthCalledWith(
      1, 'teacher1@gmail.com', 'Teacher New', expect.anything(),
    );
    expect(mockedUpsertTeacher).toHaveBeenNthCalledWith(
      2, 'teacher2@gmail.com', 'Teacher Two', expect.anything(),
    );
    expect(mockedUpsertStudent).toHaveBeenNthCalledWith(
      1, 'student1@gmail.com', 'Student New', expect.anything(),
    );
    expect(mockedUpsertStudent).toHaveBeenNthCalledWith(
      2, 'student2@gmail.com', 'Student Two', expect.anything(),
    );
    expect(mockedUpsertClass).toHaveBeenNthCalledWith(
      1, 'P1-1', 'P1 Integrity Updated', expect.anything(),
    );
    expect(mockedUpsertClass).toHaveBeenNthCalledWith(
      2, 'P2-1', 'P2 Integrity', expect.anything(),
    );
    expect(mockedUpsertSubject).toHaveBeenNthCalledWith(
      1, 'MATHS', 'Mathematics Updated', expect.anything(),
    );
    expect(mockedUpsertSubject).toHaveBeenNthCalledWith(
      2, 'SCI', 'Science', expect.anything(),
    );
    expect(mockedUpsertStudentClass).toHaveBeenCalledTimes(1);
    expect(mockedUpsertStudentClass).toHaveBeenCalledWith(202, 302, expect.anything());
    expect(mockedDeactivateStudentClass).toHaveBeenCalledTimes(1);
    expect(mockedDeactivateStudentClass).toHaveBeenCalledWith(201, 301, expect.anything());
    expect(mockedGetLocalStudentsByClassCode).toHaveBeenNthCalledWith(1, 'P1-1', undefined);
    expect(mockedGetLocalStudentsByClassCode).toHaveBeenNthCalledWith(2, 'P2-1', undefined);
    expect(mockedGetLocalStudentsByClassCode).toHaveBeenNthCalledWith(3, 'P1-1', expect.anything());
    expect(mockedGetLocalStudentsByClassCode).toHaveBeenNthCalledWith(4, 'P2-1', expect.anything());
    expect(mockedCountExternalStudentsByClassCode).toHaveBeenNthCalledWith(1, 'P1-1');
    expect(mockedCountExternalStudentsByClassCode).toHaveBeenNthCalledWith(2, 'P2-1');
    expect(mockedUpsertTeacherClassSubject).toHaveBeenNthCalledWith(
      1, 101, 401, 301, expect.anything(),
    );
    expect(mockedUpsertTeacherClassSubject).toHaveBeenNthCalledWith(
      2, 102, 402, 302, expect.anything(),
    );
  });

  it('throws when the combined local and external class size exceeds 500', async () => {
    const rows: CsvItem[] = [
      {
        teacherEmail: 'teacher1@gmail.com',
        teacherName: 'Teacher One',
        studentEmail: 'student1@gmail.com',
        studentName: 'Student One',
        classCode: 'P1-1',
        classname: 'P1 Integrity',
        subjectCode: 'MATHS',
        subjectName: 'Mathematics',
        toDelete: '0',
      },
    ];

    mockedGetLocalStudentsByClassCode.mockResolvedValueOnce(
      Array.from({ length: 500 }, (_, index) => ({
        id: index + 1,
        name: `Student ${index + 1}`,
        email: `student${index + 1}@gmail.com`,
      })),
    );
    mockedCountExternalStudentsByClassCode.mockResolvedValueOnce(1);

    const importData = prepareCsvImport(rows);
    await expect(importCsvRows(importData)).rejects.toThrow(
      'Class P1-1 cannot have more than 500 students',
    );
    expect(mockedSequelize.transaction).not.toHaveBeenCalled();
    expect(mockedUpsertClass).not.toHaveBeenCalled();
    expect(mockedUpsertTeacher).not.toHaveBeenCalled();
    expect(mockedUpsertStudent).not.toHaveBeenCalled();
    expect(mockedUpsertSubject).not.toHaveBeenCalled();
    expect(mockedUpsertTeacherClassSubject).not.toHaveBeenCalled();
  });
});
