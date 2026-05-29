import { randomBytes } from 'crypto';

export const resolveRequestId = (candidate?: string): string => {
  return candidate?.trim() || randomBytes(16).toString('hex');
};
