import path from 'path';

export const ENV_VARS = {
  PORT: 'PORT',
  MONGODB_USER: 'MONGODB_USER',
  MONGODB_PASSWORD: 'MONGODB_PASSWORD',
  MONGODB_URL: 'MONGODB_URL',
  MONGODB_DB: 'MONGODB_DB',
  APP_DOMAIN: 'APP_DOMAIN',
};

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');

export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');

export const CLOUDINARY = {
  CLOUD_NAME: 'CLOUD_NAME',
  API_KEY: 'API_KEY',
  API_SECRET: 'API_SECRET',
};
