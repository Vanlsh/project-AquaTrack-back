import { Router } from 'express';
import {
  register,
  login,
  logout,
  currentUser,
  updateUser,
  verifyEmail,
  resendVerifyEmail,
  uploadAvatar,
  getUserCount,
  refreshTokens,
} from '../controllers/users.js';
import validateBody from '../helpers/validateBody.js';
import {
  loginUserSchema,
  registerUserSchema,
  resendVerifySchema,
} from '../db/modules/user.js';
import { checkAuth } from '../middlewares/checkAuth.js';
import uploadMiddleware from '../middlewares/upload.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();
//register
router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(register),
);

//login
router.post('/login', validateBody(loginUserSchema), login);

//refreshTokens
router.post('/refresh', refreshTokens);

//logout
router.post('/logout', logout);

//currentUser
router.get('/info', checkAuth, currentUser);

//uploadAvatar
router.patch(
  '/avatars',
  checkAuth,
  uploadMiddleware.single('avatar'),
  uploadAvatar,
);

//updateUser
router.patch('/info', checkAuth, updateUser);

//getUserCount
router.get('/count', checkAuth, getUserCount);

router.get('/verify/:verificationToken', verifyEmail);
router.post('/verify', validateBody(resendVerifySchema), resendVerifyEmail);

export default router;
