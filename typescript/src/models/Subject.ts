import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { isSequelizeReady } from '../config/database';

export interface SubjectAttributes {
  id: number;
  code: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubjectCreationAttributes = Optional<
  SubjectAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Subject
  extends Model<SubjectAttributes, SubjectCreationAttributes>
  implements SubjectAttributes
{
  declare id: number;
  declare code: string;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

if (isSequelizeReady()) {
  Subject.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(64),
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
      tableName: 'subjects',
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    },
  );
}
