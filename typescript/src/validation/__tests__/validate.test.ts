import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import ErrorCodes from '../../const/ErrorCodes';
import ErrorBase from '../../errors/ErrorBase';
import { validate } from '../validate';

describe('validate', () => {
  it('returns parsed data when the schema succeeds', () => {
    const schema = z.object({
      classCode: z.string().trim().min(1),
      offset: z.string().transform((value) => Number(value)),
    });

    const parsed = validate(schema, {
      classCode: ' P1-1 ',
      offset: '2',
    });

    expect(parsed).toEqual({
      classCode: 'P1-1',
      offset: 2,
    });
  });

  it('throws an ErrorBase with the first issue message and custom error code', () => {
    const schema = z.object({
      className: z
        .string()
        .min(3, 'className must be at least 3 characters long'),
    });

    try {
      validate(schema, { className: 'ab' }, { errorCode: 1234 });
      fail('Expected validate to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorBase);

      const typedError = error as ErrorBase;
      expect(typedError.getMessage()).toBe(
        'className must be at least 3 characters long',
      );
      expect(typedError.getErrorCode()).toBe(1234);
      expect(typedError.getHttpStatusCode()).toBe(StatusCodes.BAD_REQUEST);
    }
  });

  it('uses the default invalid request error code when no override is provided', () => {
    const schema = z.object({
      limit: z.number().int().min(1, 'limit must be at least 1'),
    });

    try {
      validate(schema, { limit: 0 });
      fail('Expected validate to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorBase);

      const typedError = error as ErrorBase;
      expect(typedError.getErrorCode()).toBe(
        ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      );
      expect(typedError.getHttpStatusCode()).toBe(StatusCodes.BAD_REQUEST);
    }
  });
});
