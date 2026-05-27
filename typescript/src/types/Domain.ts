export interface TeacherRecord {
  email: string;
  name: string;
}

export interface StudentRecord {
  email: string;
  name: string;
}

export interface ClassRecord {
  code: string;
  name: string;
}

export interface SubjectRecord {
  code: string;
  name: string;
}

export interface CsvStudentClassRelation {
  studentEmail: string;
  classCode: string;
  active: boolean;
}

export interface CsvTeacherClassSubjectRelation {
  teacherEmail: string;
  classCode: string;
  subjectCode: string;
}

export interface CsvImportData {
  teachers: TeacherRecord[];
  students: StudentRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  studentClassRelations: CsvStudentClassRelation[];
  teacherClassSubjectRelations: CsvTeacherClassSubjectRelation[];
}
