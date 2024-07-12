import mongoose from 'mongoose';
import { env } from '../utils/env.js';
import { ENV_VARS } from '../constants/index.js';

export const initMongoConnection = async () => {
  try {
    const user = env(ENV_VARS.MONGODB_USER);
    const pwd = env(ENV_VARS.MONGODB_PASSWORD);
    const MONGODB_URL = process.env.MONGODB_URL;
    const db = env(ENV_VARS.MONGODB_DB);

    await mongoose
      .connect(MONGODB_URL)
      .then(() => console.log(' - Database connection successful'))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
