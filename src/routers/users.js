import { Router } from 'express';

const router = Router();

router.post('/register');

router.post('/login');

router.post('/refresh');

router.post('/logout');

router.get('/info');

router.patch('/info');

router.get('/count');

export default router;
