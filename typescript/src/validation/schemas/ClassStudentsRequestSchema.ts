import { z } from 'zod';
import { classParamsSchema } from './ClassParamsSchema';
import { classStudentsQuerySchema } from './ClassStudentsQuerySchema';

export const classStudentsRequestSchema = z.object({
  params: classParamsSchema,
  query: classStudentsQuerySchema,
});
