import { StatusCodes } from 'http-status-codes';
import Logger from '../../config/logger';
import ErrorCodes from '../../const/ErrorCodes';
import ErrorBase from '../../errors/ErrorBase';
import { runWithRequestContext } from '../../utils/requestContext';
import { updateClassName } from '../ClassService';

jest.mock('../../repositories/ClassRepository', () => ({
  updateClassName: jest.fn(),
}));

import { updateClassName as updateClassNameInRepository } from '../../repositories/ClassRepository';

const mockedUpdateClassName = updateClassNameInRepository as jest.Mock;
const infoSpy = jest.spyOn(Logger.prototype, 'info');

describe('updateClassName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trims the inputs before updating the class name', async () => {
    mockedUpdateClassName.mockResolvedValue(true);

    await runWithRequestContext({ requestId: 'request-123' }, async () => {
      await updateClassName(' P1-1 ', ' P1 Integrity Updated ');
    });

    expect(mockedUpdateClassName).toHaveBeenCalledWith(
      'P1-1',
      'P1 Integrity Updated',
    );
    expect(infoSpy).toHaveBeenCalledWith('Class name updated', {
      requestId: 'request-123',
      classCode: 'P1-1',
    });
  });

  it('rejects blank class codes or names with a bad request error', async () => {
    mockedUpdateClassName.mockResolvedValue(true);

    try {
      await updateClassName('   ', '   ');
      fail('Expected updateClassName to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorBase);

      const typedError = error as ErrorBase;
      expect(typedError.getMessage()).toBe(
        'classCode and className are required',
      );
      expect(typedError.getErrorCode()).toBe(
        ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      );
      expect(typedError.getHttpStatusCode()).toBe(StatusCodes.BAD_REQUEST);
    }

    expect(mockedUpdateClassName).not.toHaveBeenCalled();
  });

  it('returns a not found error when the class does not exist', async () => {
    mockedUpdateClassName.mockResolvedValue(false);

    try {
      await updateClassName('P1-1', 'P1 Integrity Updated');
      fail('Expected updateClassName to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorBase);

      const typedError = error as ErrorBase;
      expect(typedError.getMessage()).toBe('Class P1-1 not found');
      expect(typedError.getErrorCode()).toBe(
        ErrorCodes.RESOURCE_NOT_FOUND_ERROR_CODE,
      );
      expect(typedError.getHttpStatusCode()).toBe(StatusCodes.NOT_FOUND);
    }
  });
});
