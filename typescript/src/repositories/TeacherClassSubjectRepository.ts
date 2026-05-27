import { Transaction } from 'sequelize';
import { TeacherClassSubject } from '../models';

export const upsertTeacherClassSubject = async (
  teacherId: number,
  subjectId: number,
  classId: number,
  transaction?: Transaction,
): Promise<void> => {
  await TeacherClassSubject.findOrCreate({
    where: {
      teacherId,
      subjectId,
      classId,
    },
    defaults: {
      teacherId,
      subjectId,
      classId,
    },
    transaction,
  });
};
