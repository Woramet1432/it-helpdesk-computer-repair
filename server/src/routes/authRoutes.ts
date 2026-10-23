import { Router } from 'express';
import { login, logout, getCurrentUser, register } from '../controllers/authController.ts';
import { requireAuth } from '../middleware/auth.ts';
import { loginRateLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

router.post('/login', loginRateLimiter(), login);
router.post('/register', loginRateLimiter(), register);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;
