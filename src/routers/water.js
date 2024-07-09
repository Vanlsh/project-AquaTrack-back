import { Router } from 'express';

const router = Router();

router.post('/');

router.patch('/:waterId');

router.delete('/:waterId');

router.get('/day');

router.get('/month');

export default router;
