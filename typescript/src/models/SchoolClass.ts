import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { isSequelizeReady } from '../config/database';

export interface SchoolClassAttributes {
  id: number;
  code: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SchoolClassCreationAttributes = Optional<
  SchoolClassAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class SchoolClass
  extends Model<SchoolClassAttributes, SchoolClassCreationAttributes>
  implements SchoolClassAttributes
{
  declare id: number;
  declare code: string;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

if (isSequelizeReady()) {
  SchoolClass.init(
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
      tableName: 'classes',
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    },
  );
}
