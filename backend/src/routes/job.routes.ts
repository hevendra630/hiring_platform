import { Router } from 'express';
import * as jobController from '@controllers/job.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  experienceMin: z.number().min(0).optional(),
  experienceMax: z.number().min(0).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'internship', 'contract']).optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
  aiInterviewConfig: z.object({
    enabled: z.boolean(),
    technicalQuestionCount: z.number().min(1).max(20),
    behavioralQuestionCount: z.number().min(0).max(10),
    durationMinutes: z.number().min(10).max(120),
  }).optional()
});

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
});

// Public route to view published jobs
router.get('/published', jobController.getPublishedJobs);

// All other routes require authentication
router.use(authenticate);

// Recruiter only routes
router.post('/', authorize('recruiter'), validate(createJobSchema), jobController.createJob);
router.get('/my-jobs', authorize('recruiter'), jobController.getMyJobs);
router.put('/:id', authorize('recruiter'), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', authorize('recruiter'), jobController.deleteJob);

// Public (authenticated) route to get a specific job
router.get('/:id', jobController.getJobById);

export default router;
