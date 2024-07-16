import Joi from 'joi';

export const updateWaterSchema = Joi.object({
  amount: Joi.number().integer().example(50),
  date: Joi.string().example(1720918800000).length(13),
  norm: Joi.number().example(1.8),
}).min(1);
