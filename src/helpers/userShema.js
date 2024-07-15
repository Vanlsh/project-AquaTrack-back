import Joi from 'joi';
export const registerUserSchema = Joi.object({
  password: Joi.string().min(1).required(),
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email cannot be empty',
  }),
});

export const loginUserSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email cannot be empty',
  }),
});

export const userSchema = Joi.object({
  name: Joi.string().trim(),
  weight: Joi.number().positive(),
  dailyActiveTime: Joi.number().positive(),
  dailyWaterConsumption: Joi.number().positive(),
  gender: Joi.string().valid('women', 'man'),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be filled',
  });

export const resendVerifySchema = Joi.object({
  email: Joi.string().email().required(),
}).messages({ message: 'Missing required field email' });
