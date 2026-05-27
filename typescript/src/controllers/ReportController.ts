import Express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getWorkloadReport } from '../services/WorkloadService';

const ReportController = Express.Router();

const workloadHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await getWorkloadReport();
    return res.status(StatusCodes.OK).send(response);
  } catch (error) {
    return next(error);
  }
};

ReportController.get('/reports/workload', workloadHandler);

export default ReportController;
