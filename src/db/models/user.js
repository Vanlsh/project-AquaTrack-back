import mongoose from 'mongoose';


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



export default mongoose.model('User', userSchema);
