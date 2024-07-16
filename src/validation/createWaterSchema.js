import Joi from 'joi';

export const createWaterSchema = Joi.object({
  amount: Joi.number().integer().required().example(50).messages({
    'number.base': 'The amount of water should be a number.',
    'number.integer': 'The amount of water should be a whole number.',
    'any.required': 'The amount of water is mandatory for filling.',
  }),
  date: Joi.string().required().example('1720918800000').length(13).messages({
    'string.base': 'The date should be a line.',
    'string.length': 'The date must be 13 characters long.',
    'any.required': 'The date is required to be filled in.',
  }),
  norm: Joi.number().example(1.8).messages({
    'number.base': 'The norm should be a number.',
  }),
});
