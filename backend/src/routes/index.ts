import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import jobRoutes from './job.routes';
import resumeRoutes from './resume.routes';
import interviewRoutes from './interview.routes';
import applicationRoutes from './application.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// --- Phase 2+ modules mount here as they're built ---
router.use('/jobs', jobRoutes);
// router.use('/companies', companyRoutes);
router.use('/resumes', resumeRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/interviews', interviewRoutes);
router.use('/applications', applicationRoutes);
// router.use('/reports', reportRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/analytics', analyticsRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'HireAI API is healthy', timestamp: new Date().toISOString() });
});

export default router;
