import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { isSequelizeReady } from '../config/database';
import type { SchoolClass } from './SchoolClass';
import type { Subject } from './Subject';
import type { Teacher } from './Teacher';

export interface TeacherClassSubjectAttributes {
  id: number;
  teacherId: number;
  subjectId: number;
  classId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeacherClassSubjectCreationAttributes = Optional<
  TeacherClassSubjectAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class TeacherClassSubject
  extends Model<
    TeacherClassSubjectAttributes,
    TeacherClassSubjectCreationAttributes
  >
  implements TeacherClassSubjectAttributes
{
  declare id: number;
  declare teacherId: number;
  declare subjectId: number;
  declare classId: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare teacher?: Teacher;
  declare subject?: Subject;
  declare schoolClass?: SchoolClass;
}

if (isSequelizeReady()) {
  TeacherClassSubject.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      teacherId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      subjectId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      classId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'teacher_class_subjects',
      freezeTableName: true,
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['teacher_id', 'subject_id', 'class_id'],
          name: 'uq_teacher_class_subjects_teacher_subject_class',
        },
      ],
    },
  );
}
