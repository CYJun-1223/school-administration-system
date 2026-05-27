import { z } from 'zod';
import { requiredTrimmedString } from './shared';

export const classUpdateBodySchema = z.object({
  className: requiredTrimmedString('className'),
});
