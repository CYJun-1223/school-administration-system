import { isSequelizeReady } from '../config/database';
import { SchoolClass } from './SchoolClass';
import { StudentClass } from './StudentClass';
import { Student } from './Student';
import { Subject } from './Subject';
import { TeacherClassSubject } from './TeacherClassSubject';
import { Teacher } from './Teacher';

if (isSequelizeReady()) {
  Teacher.hasMany(TeacherClassSubject, {
    foreignKey: 'teacherId',
    as: 'teacherClassSubjects',
  });
  Subject.hasMany(TeacherClassSubject, {
    foreignKey: 'subjectId',
    as: 'teacherClassSubjects',
  });
  SchoolClass.hasMany(StudentClass, {
    foreignKey: 'classId',
    as: 'studentClasses',
  });
  SchoolClass.hasMany(TeacherClassSubject, {
    foreignKey: 'classId',
    as: 'teacherClassSubjects',
  });
  Student.hasMany(StudentClass, {
    foreignKey: 'studentId',
    as: 'studentClasses',
  });

  StudentClass.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
  });
  StudentClass.belongsTo(SchoolClass, {
    foreignKey: 'classId',
    as: 'schoolClass',
  });
  TeacherClassSubject.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher',
  });
  TeacherClassSubject.belongsTo(Subject, {
    foreignKey: 'subjectId',
    as: 'subject',
  });
  TeacherClassSubject.belongsTo(SchoolClass, {
    foreignKey: 'classId',
    as: 'schoolClass',
  });
}

export {
  SchoolClass,
  StudentClass,
  Student,
  Subject,
  TeacherClassSubject,
  Teacher,
};
