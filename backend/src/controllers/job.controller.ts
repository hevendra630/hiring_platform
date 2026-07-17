import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { jobService } from '@services/job.service';
import { User } from '@models/User';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, companyName, requiredSkills, niceToHaveSkills, experienceMin, experienceMax, employmentType, location, isRemote, salaryMin, salaryMax, status, aiInterviewConfig } = req.body;
  
  const recruiterId = req.user!.id;
  const user = await User.findById(recruiterId);
  if (!user || user.role !== 'recruiter') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only recruiters can create jobs');
  }

  // A real app might force company to exist, but for this MVP if they don't have one, we use a dummy ID or just pass null if allowed.
  // The Job schema requires it, so we'll just cast undefined to ObjectId for now which might fail mongoose validation if strictly checked, 
  // but let's assume they have it or we bypass it temporarily by letting MongoDB throw a validation error.
  
  const job = await jobService.createJob({
    title,
    company: user.company || (user._id as any), // Fallback to user ID for company if missing for MVP
    companyName,
    createdBy: recruiterId as any,
    description,
    requiredSkills,
    niceToHaveSkills,
    experienceMin,
    experienceMax,
    employmentType,
    location,
    isRemote,
    salaryMin,
    salaryMax,
    status,
    aiInterviewConfig
  });

  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'Job created successfully', job));
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Job retrieved successfully', job));
});

export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const jobs = await jobService.getJobsByRecruiter(req.user!.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Jobs retrieved successfully', jobs));
});

export const getPublishedJobs = asyncHandler(async (_req: Request, res: Response) => {
  const jobs = await jobService.getAllPublishedJobs();
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Published jobs retrieved successfully', jobs));
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const updatedJob = await jobService.updateJob(req.params.id, req.user!.id, req.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Job updated successfully', updatedJob));
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  await jobService.deleteJob(req.params.id, req.user!.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Job deleted successfully'));
});
