import { Router } from 'express';
import * as applicationController from '@controllers/application.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

const applySchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['applied', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'rejected']),
});

// Candidate routes
router.post('/apply', authorize('candidate'), validate(applySchema), applicationController.applyToJob);
router.get('/my-applications', authorize('candidate'), applicationController.getMyApplications);

// Recruiter routes
router.get('/job/:jobId', authorize('recruiter'), applicationController.getJobApplications);
router.put('/:applicationId/status', authorize('recruiter'), validate(updateStatusSchema), applicationController.updateApplicationStatus);

export default router;
