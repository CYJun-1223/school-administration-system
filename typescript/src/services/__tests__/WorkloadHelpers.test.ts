import { buildWorkloadReport } from '../WorkloadHelpers';

describe('buildWorkloadReport', () => {
  it('groups workload rows by teacher and converts counts to numbers', () => {
    const report = buildWorkloadReport([
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
        numberOfClasses: '3',
      },
      {
        teacherEmail: 'grace@example.com',
        teacherName: 'Grace Hopper',
        subjectCode: 'HIST',
        subjectName: 'History',
        numberOfClasses: '4',
      },
    ]);

    expect(report).toEqual({
      'Ada Lovelace': [
        {
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          numberOfClasses: 2,
        },
        {
          subjectCode: 'SCI',
          subjectName: 'Science',
          numberOfClasses: 3,
        },
      ],
      'Grace Hopper': [
        {
          subjectCode: 'HIST',
          subjectName: 'History',
          numberOfClasses: 4,
        },
      ],
    });
  });

  it('returns an empty report when no rows are provided', () => {
    expect(buildWorkloadReport([])).toEqual({});
  });
});
