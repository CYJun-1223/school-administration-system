import { Transaction } from 'sequelize';
import { LocalStudentRecord } from '../types/Domain';
import { SchoolClass, StudentClass, Student } from '../models';

const compareStudents = (
  left: Pick<LocalStudentRecord, 'name' | 'email' | 'id'>,
  right: Pick<LocalStudentRecord, 'name' | 'email' | 'id'>,
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

const findClassIdByCode = async (
  classCode: string,
  transaction?: Transaction,
  lock = false,
): Promise<number | null> => {
  const schoolClass = await SchoolClass.findOne({
    where: { code: classCode },
    attributes: ['id'],
    transaction,
    lock: lock && transaction ? transaction.LOCK.UPDATE : undefined,
  });

  return schoolClass?.id ?? null;
};

export const upsertClass = async (
  code: string,
  name: string,
  transaction?: Transaction,
): Promise<number> => {
  const [schoolClass, created] = await SchoolClass.findOrCreate({
    where: { code },
    defaults: { code, name },
    transaction,
  });

  if (!created && schoolClass.name !== name) {
    await schoolClass.update({ name }, { transaction });
  }

  return schoolClass.id;
};

export const updateClassName = async (
  classCode: string,
  className: string,
  transaction?: Transaction,
): Promise<boolean> => {
  const [updatedRows] = await SchoolClass.update(
    { name: className },
    {
      where: { code: classCode },
      transaction,
    },
  );

  return updatedRows > 0;
};

export const countLocalStudentsByClassCode = async (
  classCode: string,
  transaction?: Transaction,
): Promise<number> => {
  const classId = await findClassIdByCode(classCode, transaction, Boolean(transaction));
  if (classId === null) {
    return 0;
  }

  return StudentClass.count({
    where: { classId, active: true },
    transaction,
  });
};

export const getLocalStudentsByClassCode = async (
  classCode: string,
  transaction?: Transaction,
): Promise<LocalStudentRecord[]> => {
  const classId = await findClassIdByCode(classCode, transaction, Boolean(transaction));
  if (classId === null) {
    return [];
  }

  const studentClasses = await StudentClass.findAll({
    where: { classId, active: true },
    transaction,
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'email'],
        required: true,
      },
    ],
  });

  return studentClasses
    .map((relation) => relation.student)
    .filter((student): student is Student => Boolean(student))
    .map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
    }))
    .sort(compareStudents);
};
