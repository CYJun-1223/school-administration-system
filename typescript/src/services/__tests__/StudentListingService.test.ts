import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import ErrorCodes from '../../const/ErrorCodes';
import ErrorBase from '../../errors/ErrorBase';
import { getClassStudents } from '../StudentListingService';

jest.mock('axios');

jest.mock('../../repositories/ClassRepository', () => ({
  countLocalStudentsByClassCode: jest.fn(),
  getLocalStudentsByClassCode: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

import {
  countLocalStudentsByClassCode,
  getLocalStudentsByClassCode,
} from '../../repositories/ClassRepository';

const mockedCountLocal = countLocalStudentsByClassCode as jest.Mock;
const mockedGetLocal = getLocalStudentsByClassCode as jest.Mock;

describe('getClassStudents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('merges local and external students into a single sorted response', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: { count: 2, students: [] },
      })
      .mockResolvedValueOnce({
        data: {
          count: 2,
          students: [
            { id: 3, name: 'Beatrice', email: 'beatrice@example.com' },
            { id: 4, name: 'Charlie', email: 'charlie@example.com' },
          ],
        },
      });

    mockedCountLocal.mockResolvedValue(2);
    mockedGetLocal.mockResolvedValue([
      { id: 11, name: 'Delta', email: 'delta@example.com' },
      { id: 12, name: 'Bravo', email: 'bravo@example.com' },
    ]);

    const response = await getClassStudents('P1-1', 1, 2);

    expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'http://localhost:5000/students', {
      params: { class: 'P1-1', offset: 0, limit: 0 },
    });
    expect(mockedAxios.get).toHaveBeenNthCalledWith(2, 'http://localhost:5000/students', {
      params: { class: 'P1-1', offset: 0, limit: 2 },
    });
    expect(response).toEqual({
      count: 4,
      students: [
        { id: 12, name: 'Bravo', email: 'bravo@example.com', isExternal: false },
        { id: 4, name: 'Charlie', email: 'charlie@example.com', isExternal: true },
      ],
    });
  });

  it('skips the external list request when the count endpoint returns zero', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { count: 0 } });

    mockedCountLocal.mockResolvedValue(1);
    mockedGetLocal.mockResolvedValue([
      { id: 1, name: 'Aaron', email: 'aaron@example.com' },
    ]);

    const response = await getClassStudents('P1-1', 0, 10);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      count: 1,
      students: [{ id: 1, name: 'Aaron', email: 'aaron@example.com', isExternal: false }],
    });
  });

  it('maps external API failures to a bad gateway error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network down'));

    mockedCountLocal.mockResolvedValue(1);
    mockedGetLocal.mockResolvedValue([]);

    try {
      await getClassStudents('P1-1', 0, 10);
      fail('Expected getClassStudents to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorBase);
      const typedError = error as ErrorBase;
      expect(typedError.getMessage()).toBe('Unable to fetch external students');
      expect(typedError.getErrorCode()).toBe(ErrorCodes.EXTERNAL_SERVICE_ERROR_CODE);
      expect(typedError.getHttpStatusCode()).toBe(StatusCodes.BAD_GATEWAY);
    }
  });
});
