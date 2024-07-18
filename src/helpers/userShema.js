import Joi from 'joi';
export const registerUserSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid',
    'string.empty': 'Email cannot be empty',
  }),
});

export const confirmRegisterUserSchema = Joi.object({
  password: Joi.string().min(1).required(),
  verifyEmail: Joi.string().min(6).max(6).required(),
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid',
    'string.empty': 'Email cannot be empty',
  }),
});

export const loginUserSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid',
    'string.empty': 'Email cannot be empty',
  }),
});

export const userSchema = Joi.object({
  name: Joi.string().trim(),
  weight: Joi.number().positive(),
  dailyActiveTime: Joi.number().positive(),
  dailyWaterConsumption: Joi.number().positive(),
  gender: Joi.string().valid('Women', 'Man'),
  photo: Joi.string().uri(),
}).min(1)
  .messages({
    'object.min': 'At least one field must be filled',
  });


export const resendVerifySchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid',
    'string.empty': 'Email cannot be empty',
  }),
})
