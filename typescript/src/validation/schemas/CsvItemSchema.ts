import { z } from 'zod';
import { requiredTrimmedString } from './shared';

export const csvItemSchema = z.object({
  teacherEmail: requiredTrimmedString('teacherEmail').email(
    'teacherEmail must be a valid email',
  ),
  teacherName: requiredTrimmedString('teacherName'),
  studentEmail: requiredTrimmedString('studentEmail').email(
    'studentEmail must be a valid email',
  ),
  studentName: requiredTrimmedString('studentName'),
  classCode: requiredTrimmedString('classCode'),
  classname: requiredTrimmedString('classname'),
  subjectCode: requiredTrimmedString('subjectCode'),
  subjectName: requiredTrimmedString('subjectName'),
  toDelete: z.enum(['0', '1'], {
    errorMap: () => ({ message: 'toDelete must be 0 or 1' }),
  }),
});
