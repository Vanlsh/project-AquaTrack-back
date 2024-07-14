import Joi from 'joi';

export const createWaterSchema = Joi.object({
  amount: Joi.number().integer().required().example(50),
  date: Joi.date().timestamp().required().example(1720717617),
  norm: Joi.number().required().example(1.8),
});
