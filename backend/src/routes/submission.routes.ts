import { Router } from 'express';
import * as submissionController from '@controllers/submission.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const submitSchema = z.object({
  problemId: z.string(),
  language: z.enum(['cpp', 'java', 'python', 'javascript']),
  sourceCode: z.string().min(1),
  isFinal: z.boolean().default(true),
});

router.use(authenticate);

router.post('/', validate(submitSchema), submissionController.submitCode);
router.get('/problem/:problemId', submissionController.getMySubmissions);

export default router;
