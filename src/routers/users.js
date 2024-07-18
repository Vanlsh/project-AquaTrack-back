import { Router } from 'express';
import {
  register,
  confirmRegister,
  login,
  logout,
  currentUser,
  updateUser,
  resendVerifyEmail,
  uploadAvatar,
  getUserCount,
  refreshTokens,
} from '../controllers/users.js';
import validateBody from '../helpers/validateBody.js';
import {
  loginUserSchema,
  registerUserSchema,
  confirmRegisterUserSchema,
  resendVerifySchema,
  userSchema,
} from '../helpers/userShema.js';
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

//confirmregister
router.post(
  '/confirmregister',
  validateBody(confirmRegisterUserSchema),
  ctrlWrapper(confirmRegister),
);

//login
router.post('/login', validateBody(loginUserSchema), ctrlWrapper(login));

//refreshTokens
router.post('/refresh', ctrlWrapper(refreshTokens));

//logout
router.post('/logout', checkAuth, ctrlWrapper(logout));

//currentUser
router.get('/info', checkAuth, ctrlWrapper(currentUser));

//uploadAvatar
router.patch(
  '/avatars',
  checkAuth,
  uploadMiddleware.single('avatar'),
  ctrlWrapper(uploadAvatar),
);

//updateUser
router.patch('/info', checkAuth, validateBody(userSchema), ctrlWrapper(updateUser));

//getUserCount
router.get('/count', checkAuth, ctrlWrapper(getUserCount));

router.post(
  '/resendVerify',
  validateBody(resendVerifySchema),
  ctrlWrapper(resendVerifyEmail),
);

export default router;
