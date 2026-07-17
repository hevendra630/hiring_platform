import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { applicationService } from '@services/application.service';
import { Resume } from '@models/Resume';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.body;
  const candidateId = req.user!.id;

  if (req.user!.role !== 'candidate') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only candidates can apply to jobs');
  }

  // Find candidate's active resume
  const activeResume = await Resume.findOne({ candidate: candidateId, isActive: true });
  if (!activeResume) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must have an active resume to apply for a job');
  }

  const application = await applicationService.applyToJob({
    job: jobId as any,
    candidate: candidateId as any,
    resume: activeResume._id as any,
  });

  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'Successfully applied to job', application));
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await applicationService.getCandidateApplications(req.user!.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Applications retrieved successfully', applications));
});

export const getJobApplications = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const applications = await applicationService.getJobApplications(jobId, req.user!.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Job applications retrieved successfully', applications));
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  const updatedApplication = await applicationService.updateApplicationStatus(applicationId, status, req.user!.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Application status updated', updatedApplication));
});
