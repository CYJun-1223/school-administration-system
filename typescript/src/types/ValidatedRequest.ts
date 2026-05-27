import type { Request } from 'express';

export interface ValidatedRequest<TValidated> extends Request {
  validated?: TValidated;
}
