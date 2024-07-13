import Joi from 'joi';

export const updateWaterSchema = Joi.object({
  amount: Joi.number().integer().example(50),
  date: Joi.date().timestamp().example(1720717617),
  norm: Joi.number().example(1.8),
}).min(1);
