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

export interface StudentListingRecord {
  id: number;
  name: string;
  email: string;
  isExternal: boolean;
}

export interface StudentListResponse {
  count: number;
  students: StudentListingRecord[];
}

export interface ExternalStudentRecord {
  id: number;
  name: string;
  email: string;
}

export interface LocalStudentRecord {
  id: number;
  name: string;
  email: string;
}

export interface WorkloadSubjectSummary {
  subjectCode: string;
  subjectName: string;
  numberOfClasses: number;
}

export type WorkloadReport = Record<string, WorkloadSubjectSummary[]>;

export interface WorkloadRow {
  teacherEmail: string;
  teacherName: string;
  subjectCode: string;
  subjectName: string;
  numberOfClasses: number | string;
}
