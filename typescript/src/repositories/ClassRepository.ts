import { Transaction } from 'sequelize';
import { SchoolClass } from '../models';

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
