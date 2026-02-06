import { Router } from 'express';
import { AuthController } from '@controllers/AuthController';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { optionalAuth } from '@middleware/auth.middleware';

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository();
const authController = new AuthController(userRepository);

// Google OAuth routes
router.get('/google', authController.googleSignIn);
router.get('/google/callback', authController.googleCallback);

// Session routes
router.get('/session', optionalAuth, authController.getSession);
router.post('/signout', authController.signOut);

export default router;
