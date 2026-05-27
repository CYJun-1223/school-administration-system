import Express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';
import { getClassStudents } from '../services/StudentListingService';
import { updateClassName } from '../services/ClassService';
import { StudentListResponse } from '../types/Domain';
import {
  classStudentsRequestSchema,
  classUpdateRequestSchema,
} from '../validation/RequestSchemas';
import { validate } from '../validation/validate';

const ClassController = Express.Router();

type ClassStudentsRawRequest = z.input<typeof classStudentsRequestSchema>;
type ClassStudentsRequest = z.infer<typeof classStudentsRequestSchema>;
type ClassUpdateRawRequest = z.input<typeof classUpdateRequestSchema>;
type ClassUpdateRequest = z.infer<typeof classUpdateRequestSchema>;

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

const updateClassHandler = async (
  req: Request<
    ClassUpdateRawRequest['params'],
    unknown,
    ClassUpdateRawRequest['body']
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      params: { classCode },
      body: { className },
    } = validate<ClassUpdateRequest>(classUpdateRequestSchema, {
      params: req.params,
      body: req.body,
    });

    await updateClassName(classCode, className);

    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    return next(error);
  }
};

ClassController.get('/class/:classCode/students', getStudentsHandler);
ClassController.put('/class/:classCode', updateClassHandler);

export default ClassController;
