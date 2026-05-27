import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { isSequelizeReady } from '../config/database';

export interface TeacherAttributes {
  id: number;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeacherCreationAttributes = Optional<
  TeacherAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Teacher
  extends Model<TeacherAttributes, TeacherCreationAttributes>
  implements TeacherAttributes
{
  declare id: number;
  declare email: string;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

if (isSequelizeReady()) {
  Teacher.init(
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
      tableName: 'teachers',
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    },
  );
}
