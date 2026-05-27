import { CsvItem } from '../../types/CsvItem';
import { prepareCsvImport } from '../CsvImportPreparer';

describe('prepareCsvImport', () => {
  it('keeps the latest values for duplicate keys and ignores blank rows', () => {
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
        teacherEmail: '   ',
        teacherName: '   ',
        studentEmail: '   ',
        studentName: '   ',
        classCode: '   ',
        classname: '   ',
        subjectCode: '   ',
        subjectName: '   ',
        toDelete: '   ',
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

    const importData = prepareCsvImport(rows);

    expect(importData.teachers).toEqual([
      { email: 'teacher1@gmail.com', name: 'Teacher New' },
      { email: 'teacher2@gmail.com', name: 'Teacher Two' },
    ]);
    expect(importData.students).toEqual([
      { email: 'student1@gmail.com', name: 'Student New' },
      { email: 'student2@gmail.com', name: 'Student Two' },
    ]);
    expect(importData.classes).toEqual([
      { code: 'P1-1', name: 'P1 Integrity Updated' },
      { code: 'P2-1', name: 'P2 Integrity' },
    ]);
    expect(importData.subjects).toEqual([
      { code: 'MATHS', name: 'Mathematics Updated' },
      { code: 'SCI', name: 'Science' },
    ]);
    expect(importData.studentClassRelations).toEqual([
      {
        studentEmail: 'student1@gmail.com',
        classCode: 'P1-1',
        active: false,
      },
      {
        studentEmail: 'student2@gmail.com',
        classCode: 'P2-1',
        active: true,
      },
    ]);
    expect(importData.teacherClassSubjectRelations).toEqual([
      {
        teacherEmail: 'teacher1@gmail.com',
        classCode: 'P1-1',
        subjectCode: 'MATHS',
      },
      {
        teacherEmail: 'teacher2@gmail.com',
        classCode: 'P2-1',
        subjectCode: 'SCI',
      },
    ]);
  });
});
