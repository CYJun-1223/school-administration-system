import Express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';
import { getClassStudents } from '../services/StudentListingService';
import { StudentListResponse } from '../types/Domain';
import { classStudentsRequestSchema } from '../validation/RequestSchemas';
import { validate } from '../validation/validate';

const ClassController = Express.Router();

type ClassStudentsRawRequest = z.input<typeof classStudentsRequestSchema>;
type ClassStudentsRequest = z.infer<typeof classStudentsRequestSchema>;

const getStudentsHandler = async (
  req: Request<
    ClassStudentsRawRequest['params'],
    StudentListResponse,
    unknown,
    ClassStudentsRawRequest['query']
  >,
  res: Response<StudentListResponse>,
  next: NextFunction,
) => {
  try {
    const {
      params: { classCode },
      query: { offset, limit },
    } = validate<ClassStudentsRequest>(
      classStudentsRequestSchema,
      {
        params: req.params,
        query: req.query,
      },
    );

    const response: StudentListResponse = await getClassStudents(
      classCode,
      offset,
      limit,
    );

    return res.status(StatusCodes.OK).send(response);
  } catch (error) {
    return next(error);
  }
};

ClassController.get('/class/:classCode/students', getStudentsHandler);

export default ClassController;
