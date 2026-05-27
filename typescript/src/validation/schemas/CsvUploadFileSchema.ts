import { z } from 'zod';
import {
  ALLOWED_CSV_MIME_TYPES,
  MAX_CSV_UPLOAD_BYTES,
} from '../../const/CsvUpload';
import { requiredTrimmedString } from './shared';

const csvUploadFileObjectSchema = z.object({
  path: requiredTrimmedString('path'),
  originalname: requiredTrimmedString('originalname').refine(
    (value) => value.toLowerCase().endsWith('.csv'),
    { message: 'originalname must end with .csv' },
  ),
  mimetype: z.enum(ALLOWED_CSV_MIME_TYPES, {
    errorMap: () => ({ message: 'mimetype must be a supported CSV file type' }),
  }),
  size: z
    .number()
    .int({ message: 'size must be an integer' })
    .positive({ message: 'size must be greater than 0' })
    .max(MAX_CSV_UPLOAD_BYTES, {
      message: `CSV file must be ${MAX_CSV_UPLOAD_BYTES} bytes or less`,
    }),
});

export const csvUploadFileSchema = z
  .union([csvUploadFileObjectSchema, z.undefined()])
  .transform((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CSV file is required',
      });

      return z.NEVER;
    }

    return value;
  });
