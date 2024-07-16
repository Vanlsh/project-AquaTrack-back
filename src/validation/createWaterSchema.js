import Joi from 'joi';

export const createWaterSchema = Joi.object({
  amount: Joi.number().integer().required().example(50),
  date: Joi.string().required().example(1720918800000).length(13),
  norm: Joi.number().example(1.8),
});
