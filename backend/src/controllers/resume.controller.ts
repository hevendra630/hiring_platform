import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { resumeService } from '@services/resume.service';
import httpStatus from 'http-status';
import { User } from '@models/User';
import { ApiError } from '@utils/ApiError';

export const getMyResume = asyncHandler(async (req: Request, res: Response) => {
  const candidateId = req.user!.id;
  const resume = await resumeService.getMyResume(candidateId);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Resume retrieved successfully', resume));
});

export const saveMyResume = asyncHandler(async (req: Request, res: Response) => {
  const candidateId = req.user!.id;
  const user = await User.findById(candidateId);
  
  if (!user || user.role !== 'candidate') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only candidates can manage their resumes');
  }

  const { analysis, fileUrl, cloudinaryPublicId, originalFileName } = req.body;
  
  const updatedResume = await resumeService.saveOrUpdateResume(candidateId, {
    analysis,
    fileUrl,
    cloudinaryPublicId,
    originalFileName
  });

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Resume saved successfully', updatedResume));
});

export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  const candidateId = req.user!.id;
  
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  // Parse the PDF buffer
  const analysis = await resumeService.parseResume(req.file.buffer);

  // In a real app we'd upload to Cloudinary here. For MVP, we mock the URL.
  const fileUrl = `https://hireai-storage.com/${req.file.originalname}`;
  
  const updatedResume = await resumeService.saveOrUpdateResume(candidateId, {
    analysis,
    fileUrl,
    cloudinaryPublicId: `mock_${Date.now()}`,
    originalFileName: req.file.originalname
  });

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Resume uploaded and analyzed successfully', updatedResume));
});
