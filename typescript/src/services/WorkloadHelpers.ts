import {
  WorkloadReport,
  WorkloadRow,
  WorkloadSubjectSummary,
} from '../types/Domain';

export const buildWorkloadReport = (rows: WorkloadRow[]): WorkloadReport => {
  return rows.reduce<WorkloadReport>((accumulator, row) => {
    const teacherKey = row.teacherName;
    const subjectSummary: WorkloadSubjectSummary = {
      subjectCode: row.subjectCode,
      subjectName: row.subjectName,
      numberOfClasses: Number(row.numberOfClasses),
    };

    if (!accumulator[teacherKey]) {
      accumulator[teacherKey] = [];
    }

    accumulator[teacherKey].push(subjectSummary);
    return accumulator;
  }, {});
};
