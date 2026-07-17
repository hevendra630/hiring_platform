import { Router } from 'express';
import * as problemController from '@controllers/problem.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
  weight: z.number().default(1),
});

const createProblemSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  sampleTestCases: z.array(testCaseSchema),
  hiddenTestCases: z.array(testCaseSchema),
  starterCode: z.record(z.string()).optional(),
  timeLimitMs: z.number().optional(),
  memoryLimitMb: z.number().optional(),
  isPublished: z.boolean().optional(),
});

router.use(authenticate);

// Public (authenticated)
router.get('/published', problemController.getPublishedProblems);
router.get('/:id', problemController.getProblemById);

// Admin/Recruiter
router.post('/', authorize('admin', 'recruiter'), validate(createProblemSchema), problemController.createProblem);

export default router;
