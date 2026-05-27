import { Transaction } from 'sequelize';
import { StudentClass } from '../models';

const syncStudentClassActiveState = async (
  studentId: number,
  classId: number,
  active: boolean,
  transaction?: Transaction,
): Promise<void> => {
  const studentClass = await StudentClass.findOne({
    where: {
      studentId,
      classId,
    },
    transaction,
  });

  if (!studentClass) {
    await StudentClass.create(
      {
        studentId,
        classId,
        active,
      },
      {
        transaction,
      },
    );

    return;
  }

  if (Boolean(studentClass.active) !== active) {
    await studentClass.update(
      {
        active,
      },
      {
        transaction,
      },
    );
  }
};

export const upsertStudentClass = async (
  studentId: number,
  classId: number,
  transaction?: Transaction,
): Promise<void> => {
  await syncStudentClassActiveState(studentId, classId, true, transaction);
};

export const deactivateStudentClass = async (
  studentId: number,
  classId: number,
  transaction?: Transaction,
): Promise<void> => {
  await syncStudentClassActiveState(studentId, classId, false, transaction);
};
