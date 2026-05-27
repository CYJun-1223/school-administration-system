import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { isSequelizeReady } from '../config/database';

export interface StudentAttributes {
  id: number;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StudentCreationAttributes = Optional<
  StudentAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Student
  extends Model<StudentAttributes, StudentCreationAttributes>
  implements StudentAttributes
{
  declare id: number;
  declare email: string;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

if (isSequelizeReady()) {
  Student.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'students',
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    },
  );
}
