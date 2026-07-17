import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { interviewService } from '@services/interview.service';
import httpStatus from 'http-status';

export const scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
  const recruiterId = req.user!.id;
  const interview = await interviewService.scheduleInterview(recruiterId, req.body);
  
  // Populate candidate and job for email
  const populated = await interview.populate([
    { path: 'candidate', select: 'name email' },
    { path: 'job', select: 'title' }
  ]);

  if (populated.candidate && (populated.candidate as any).email) {
    const { emailService } = require('@services/email.service');
    const interviewUrl = `http://localhost:5173/candidate/interviews`; // Hardcoded frontend URL for MVP
    
    // We send asynchronously so we don't block the response
    emailService.sendInterviewInvite(
      (populated.candidate as any).email,
      (populated.candidate as any).name,
      (populated.job as any).title,
      new Date(populated.scheduledAt as any),
      populated.durationMinutes || 45,
      interviewUrl
    ).catch((err: any) => console.error('Failed to send interview invite:', err));
  }

  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'Interview scheduled successfully', populated));
});

export const getMyInterviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  let interviews;
  if (role === 'candidate') {
    interviews = await interviewService.getMyInterviewsAsCandidate(userId);
  } else {
    interviews = await interviewService.getMyInterviewsAsRecruiter(userId);
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Interviews retrieved successfully', interviews));
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
   const { id } = req.params;
  const { status } = req.body;

  const updated = await interviewService.updateInterviewStatus(id, req.user!.id, req.user!.role as 'candidate' | 'recruiter', status);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Status updated', updated));
});

export const chatWithAi = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const candidateId = req.user!.id;

  const { aiService } = require('@services/ai.service');
  const responseMessage = await aiService.processChatMessage(id, candidateId, message);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Message processed', { reply: responseMessage }));
});

export const logProctoringEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const candidateId = req.user!.id;
  const event = req.body;

  const updated = await interviewService.logProctoringEvent(id, candidateId, event);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Event logged', updated));
});

export const draftFeedbackEmail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const recruiterId = req.user!.id;
  const { ApiError } = require('@utils/ApiError');

  const interviews = await interviewService.getMyInterviewsAsRecruiter(recruiterId);
  const interview = interviews.find((i: any) => i._id.toString() === id);
  
  if (!interview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interview not found');
  }

  // Use OpenAI to draft email
  let draft = '';
  const { OpenAI } = require('openai');
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `Draft a professional email from a recruiter to a candidate named ${(interview.candidate as any)?.name || 'Candidate'}. 
                      The candidate interviewed for the role of ${(interview.job as any)?.title || 'the position'}.
                      Their overall score was ${interview.overallScore || 'N/A'}/100.
                      Keep it brief, polite, and constructive.`;
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      });
      draft = response.choices[0].message.content || '';
    } catch (err) {
      console.error('OpenAI Error during draft generation:', err);
    }
  }

  if (!draft) {
    // Fallback template
    draft = `Hi ${(interview.candidate as any)?.name || 'Candidate'},\n\nThank you for interviewing for the ${(interview.job as any)?.title || 'position'}. Your overall score was ${interview.overallScore || 'N/A'}/100.\n\nWe will be in touch shortly with next steps.\n\nBest,\nRecruitment Team`;
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Draft generated', { draft }));
});
