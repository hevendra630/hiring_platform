import { Router } from 'express';
import * as userController from '@controllers/user.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *   patch:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile (name, avatar)
 */
router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);

export default router;
