import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { problemService } from '@services/problem.service';
import httpStatus from 'http-status';
import { ApiError } from '@utils/ApiError';

export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== 'admin' && req.user!.role !== 'recruiter') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins or recruiters can create problems');
  }

  const problem = await problemService.createProblem({
    ...req.body,
    createdBy: req.user!.id,
  });

  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'Problem created successfully', problem));
});

export const getProblemById = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.getProblemById(req.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Problem retrieved successfully', problem));
});

export const getPublishedProblems = asyncHandler(async (_req: Request, res: Response) => {
  const problems = await problemService.getAllPublishedProblems();
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Published problems retrieved successfully', problems));
});
