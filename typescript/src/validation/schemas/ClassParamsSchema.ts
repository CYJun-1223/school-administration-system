import { z } from 'zod';
import { requiredTrimmedString } from './shared';

export const classParamsSchema = z.object({
  classCode: requiredTrimmedString('classCode'),
});
