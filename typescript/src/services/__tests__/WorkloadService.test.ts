import { getWorkloadReport } from '../WorkloadService';

jest.mock('../../repositories/WorkloadRepository', () => ({
  getWorkloadRows: jest.fn(),
}));

import { getWorkloadRows } from '../../repositories/WorkloadRepository';

const mockedGetWorkloadRows = getWorkloadRows as jest.Mock;

describe('getWorkloadReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the workload report built from repository rows', async () => {
    mockedGetWorkloadRows.mockResolvedValue([
      {
        teacherEmail: 'ada@example.com',
        teacherName: 'Ada Lovelace',
        subjectCode: 'MATHS',
        subjectName: 'Mathematics',
        numberOfClasses: '2',
      },
      {
        teacherEmail: 'ada@example.com',
        teacherName: 'Ada Lovelace',
        subjectCode: 'SCI',
        subjectName: 'Science',
        numberOfClasses: 1,
      },
    ]);

    await expect(getWorkloadReport()).resolves.toEqual({
      'Ada Lovelace': [
        {
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          numberOfClasses: 2,
        },
        {
          subjectCode: 'SCI',
          subjectName: 'Science',
          numberOfClasses: 1,
        },
      ],
    });

    expect(mockedGetWorkloadRows).toHaveBeenCalledTimes(1);
  });
});
