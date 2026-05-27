import { WorkloadReport } from '../types/Domain';
import { buildWorkloadReport } from './WorkloadHelpers';
import { getWorkloadRows } from '../repositories/WorkloadRepository';

export const getWorkloadReport = async (): Promise<WorkloadReport> => {
  const rows = await getWorkloadRows();
  return buildWorkloadReport(rows);
};
