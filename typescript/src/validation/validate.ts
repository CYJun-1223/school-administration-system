import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodTypeAny } from 'zod';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';

interface ValidateOptions {
  errorCode?: number;
  fallbackMessage?: string;
}

export const validate = <T>(
  schema: ZodTypeAny,
  value: unknown,
  options: ValidateOptions = {},
): T => {
  const result = schema.safeParse(value);

  if (!result.success) {
    const error = (result as { error: ZodError }).error;
    const firstIssue = error.issues[0];
    const message =
      firstIssue?.message ?? options.fallbackMessage ?? 'Invalid request';

    throw new ErrorBase(
      message,
      options.errorCode ?? ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      StatusCodes.BAD_REQUEST,
    );
  }

  return result.data as T;
};
