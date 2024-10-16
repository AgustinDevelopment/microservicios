import { Sequelize } from 'sequelize-typescript';

export const handleTransaction = async (sequelize: Sequelize, action: Function) => {
  const transaction = await sequelize.transaction();
  try {
    await action(transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
