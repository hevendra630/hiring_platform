import { Router } from 'express';
import * as resumeController from '@controllers/resume.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const saveResumeSchema = z.object({
  fileUrl: z.string().url().optional(),
  cloudinaryPublicId: z.string().optional(),
  originalFileName: z.string().optional(),
  analysis: z.object({
    atsScore: z.number().min(0).max(100).optional(),
    extractedSkills: z.array(z.string()).optional(),
    missingSkills: z.array(z.string()).optional(),
    suitableRoles: z.array(z.string()).optional(),
    improvementSuggestions: z.array(z.string()).optional(),
    summary: z.string().optional(),
    education: z.array(z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string().optional()
    })).optional(),
    experience: z.array(z.object({
      title: z.string(),
      company: z.string(),
      durationMonths: z.number().optional(),
      summary: z.string().optional()
    })).optional(),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      techStack: z.array(z.string())
    })).optional(),
  }).optional()
});

import { upload } from '@utils/upload';

router.use(authenticate);

// Candidate routes
router.get('/me', authorize('candidate'), resumeController.getMyResume);
router.post('/me', authorize('candidate'), validate(saveResumeSchema), resumeController.saveMyResume);
router.post('/upload', authorize('candidate'), upload.single('resume'), resumeController.uploadResume);

export default router;
