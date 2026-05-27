import { z } from 'zod';

export const requiredTrimmedString = (fieldName: string): z.ZodString =>
  z
    .string()
    .trim()
    .min(1, { message: `${fieldName} is required` });
