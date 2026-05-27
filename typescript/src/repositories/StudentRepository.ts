import { Transaction } from 'sequelize';
import { Student } from '../models';

export const upsertStudent = async (
  email: string,
  name: string,
  transaction?: Transaction,
): Promise<number> => {
  const [student, created] = await Student.findOrCreate({
    where: { email },
    defaults: { email, name },
    transaction,
  });

  if (!created && student.name !== name) {
    await student.update({ name }, { transaction });
  }

  return student.id;
};
