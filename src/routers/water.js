import { Router } from 'express';
import {
  createWaterController,
  getWaterByIdController,
  updateWaterController,
  deleteWaterController,
  getWaterPrDayController,
  getWaterPrMonthController,
} from '../controllers/water.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateMongoId } from '../middlewares/validateMongoId.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createWaterSchema } from '../validation/createWaterSchema.js';
import { updateWaterSchema } from '../validation/updateWaterSchema.js';
import { checkAuth } from '../middlewares/checkAuth.js';

const router = Router();

router.use(checkAuth);

router.post(
  '/',
  validateBody(createWaterSchema),
  ctrlWrapper(createWaterController),
);

router.get('/:id', validateMongoId('id'), ctrlWrapper(getWaterByIdController));

router.patch(
  '/:id',
  validateBody(updateWaterSchema),
  validateMongoId('id'),
  ctrlWrapper(updateWaterController),
);

router.delete(
  '/:id',
  validateMongoId('id'),
  ctrlWrapper(deleteWaterController),
);

router.get('/day/:date', ctrlWrapper(getWaterPrDayController));

router.get('/month/:date', ctrlWrapper(getWaterPrMonthController));

export default router;
