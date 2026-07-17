import { Router } from 'express';
import * as interviewController from '@controllers/interview.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const scheduleSchema = z.object({
  candidate: z.string(),
  job: z.string(),
  type: z.enum(['ai', 'coding', 'combined']).optional(),
  scheduledAt: z.string().optional(),
  durationMinutes: z.number().optional(),
  aiPersona: z.object({
    difficulty: z.enum(['easy', 'dynamic', 'hard']),
    tone: z.enum(['friendly', 'strict'])
  }).optional()
});

const statusSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'expired', 'cancelled'])
});

const proctoringSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  details: z.string().optional()
});

router.use(authenticate);

// Both candidate and recruiter can fetch their respective interviews
router.get('/me', interviewController.getMyInterviews);

// Both can update status (candidate can only start/complete)
router.put('/:id/status', validate(statusSchema), interviewController.updateStatus);

// Candidate interacting with AI
const chatSchema = z.object({
  message: z.string().min(1)
});
router.post('/:id/chat', authorize('candidate'), validate(chatSchema), interviewController.chatWithAi);

// Candidate logging proctoring events
router.post('/:id/proctoring', authorize('candidate'), validate(proctoringSchema), interviewController.logProctoringEvent);

// Only recruiters can schedule interviews
router.post('/schedule', authorize('recruiter'), validate(scheduleSchema), interviewController.scheduleInterview);

// Draft feedback email
router.post('/:id/draft-email', authorize('recruiter'), interviewController.draftFeedbackEmail);

export default router;
