import { Transaction } from 'sequelize';
import { Teacher } from '../models';

export const upsertTeacher = async (
  email: string,
  name: string,
  transaction?: Transaction,
): Promise<number> => {
  const [teacher, created] = await Teacher.findOrCreate({
    where: { email },
    defaults: { email, name },
    transaction,
  });

  if (!created && teacher.name !== name) {
    await teacher.update({ name }, { transaction });
  }

  return teacher.id;
};
