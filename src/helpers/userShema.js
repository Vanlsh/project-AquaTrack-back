import Joi from 'joi';
export const registerUserSchema = Joi.object({
  password: Joi.string().min(1).required(),
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid',
    'string.empty': 'Email cannot be empty',
  }),
}).min(1);

export const loginUserSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid',
    'string.empty': 'Email cannot be empty',
  }),
});

export const resendVerifySchema = Joi.object({
  email: Joi.string().email().required(),
}).messages({ message: 'Missing required field email' });
