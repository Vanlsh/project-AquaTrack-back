import Joi from 'joi';

export const updateWaterSchema = Joi.object({
  amount: Joi.number().integer().example(50).messages({
    'number.base': 'The amount of water should be a number.',
    'number.integer': 'The amount of water should be a whole number.',
  }),
  date: Joi.string().example('1720918800000').length(13).messages({
    'string.base': 'The date should be a line.',
    'string.length': 'The date must be 13 characters long.',
  }),
  norm: Joi.number().example(1.8).messages({
    'number.base': 'The norm should be a number.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'You must specify at least one field to update.',
  });
