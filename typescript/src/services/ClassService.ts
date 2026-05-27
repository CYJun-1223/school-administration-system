import { StatusCodes } from 'http-status-codes';
import ErrorCodes from '../const/ErrorCodes';
import ErrorBase from '../errors/ErrorBase';
import { updateClassName as updateClassNameInRepository } from '../repositories/ClassRepository';

export const updateClassName = async (
  classCode: string,
  className: string,
): Promise<void> => {
  const normalizedClassCode = classCode.trim();
  const normalizedClassName = className.trim();

  if (!normalizedClassCode || !normalizedClassName) {
    throw new ErrorBase(
      'classCode and className are required',
      ErrorCodes.INVALID_REQUEST_ERROR_CODE,
      StatusCodes.BAD_REQUEST,
    );
  }

  const updated = await updateClassNameInRepository(
    normalizedClassCode,
    normalizedClassName,
  );
  if (!updated) {
    throw new ErrorBase(
      `Class ${normalizedClassCode} not found`,
      ErrorCodes.RESOURCE_NOT_FOUND_ERROR_CODE,
      StatusCodes.NOT_FOUND,
    );
  }
};
