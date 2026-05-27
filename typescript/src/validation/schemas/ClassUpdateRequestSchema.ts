import { z } from 'zod';
import { classParamsSchema } from './ClassParamsSchema';
import { classUpdateBodySchema } from './ClassUpdateBodySchema';

export const classUpdateRequestSchema = z.object({
  params: classParamsSchema,
  body: classUpdateBodySchema,
});
