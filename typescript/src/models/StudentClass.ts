import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { isSequelizeReady } from '../config/database';
import type { SchoolClass } from './SchoolClass';
import type { Student } from './Student';

export interface StudentClassAttributes {
  id: number;
  studentId: number;
  classId: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StudentClassCreationAttributes = Optional<
  StudentClassAttributes,
  'id' | 'active' | 'createdAt' | 'updatedAt'
>;

export class StudentClass
  extends Model<StudentClassAttributes, StudentClassCreationAttributes>
  implements StudentClassAttributes
{
  declare id: number;
  declare studentId: number;
  declare classId: number;
  declare active: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare student?: Student;
  declare schoolClass?: SchoolClass;
}

if (isSequelizeReady()) {
  StudentClass.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      classId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'student_classes',
      freezeTableName: true,
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['student_id', 'class_id'],
          name: 'uq_student_classes_student_class',
        },
      ],
    },
  );
}
