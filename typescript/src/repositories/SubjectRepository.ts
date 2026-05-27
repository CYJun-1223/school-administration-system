import { Transaction } from 'sequelize';
import { Subject } from '../models';

export const upsertSubject = async (
  code: string,
  name: string,
  transaction?: Transaction,
): Promise<number> => {
  const [subject, created] = await Subject.findOrCreate({
    where: { code },
    defaults: { code, name },
    transaction,
  });

  if (!created && subject.name !== name) {
    await subject.update({ name }, { transaction });
  }

  return subject.id;
};
