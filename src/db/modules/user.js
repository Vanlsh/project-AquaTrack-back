import mongoose from 'mongoose';
import Joi from 'joi';

const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    token: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: 'User',
    },
    weight: {
      type: Number,
      default: 0,
    },
    dailyActiveTime: {
      type: Number,
      default: 0,
    },
    dailyWaterConsumption: {
      type: Number,
      default: 1.5,
    },
    gender: {
      type: String,
      enum: ['Women', 'Men'],
      default: 'Women',
    },
    photo: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

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

// const validSubscriptions = ['starter', 'pro', 'business'];

// export const subscriptionUserSchema = Joi.object({
//   subscription: Joi.string()
//     .valid(...validSubscriptions)
//     .required(),
// });

export const resendVerifySchema = Joi.object({
  email: Joi.string().email().required(),
}).messages({ message: 'Missing required field email' });


export default mongoose.model('User', userSchema);
