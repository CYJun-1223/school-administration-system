import { z } from 'zod';

export const requiredTrimmedString = (fieldName: string): z.ZodString =>
  z
    .string()
    .trim()
    .min(1, { message: `${fieldName} is required` });

export const integerQueryParam = (
  fieldName: string,
  minimum: number
): z.ZodEffects<z.ZodAny, number, unknown> =>
  z.any().transform((value, ctx) => {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const parsedValue =
      typeof rawValue === 'number' ? rawValue : Number(rawValue);

    if (!Number.isInteger(parsedValue) || parsedValue < minimum) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldName} must be an integer greater than or equal to ${minimum}`,
      });

      return z.NEVER;
    }

    return parsedValue;
  });
