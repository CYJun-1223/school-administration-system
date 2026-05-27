import { z } from 'zod';
import { integerQueryParam } from './shared';

export const classStudentsQuerySchema = z.object({
  offset: integerQueryParam('offset', 0),
  limit: integerQueryParam('limit', 1),
});
