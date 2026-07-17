import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { submissionService } from '@services/submission.service';
import httpStatus from 'http-status';

export const submitCode = asyncHandler(async (req: Request, res: Response) => {
  const { problemId, language, sourceCode, isFinal } = req.body;
  const candidateId = req.user!.id;

  const submission = await submissionService.submitCode(
    candidateId,
    problemId,
    language,
    sourceCode,
    isFinal
  );

  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'Code submitted successfully', submission));
});

export const getMySubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const candidateId = req.user!.id;

  const submissions = await submissionService.getMySubmissionsForProblem(candidateId, problemId);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Submissions retrieved', submissions));
});
