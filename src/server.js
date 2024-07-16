import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './utils/env.js';
import { ENV_VARS } from './constants/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import router from './routers/index.js';

const allowedOrigins = {
  origin: [
    'https://project-aqua-track-front.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
};

const corsOptions = {
  origin: [
    'https://project-aqua-track-front.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
  // optionSuccessStatus: 200,
  // Headers: true,
  // exposedHeaders: 'Set-Cookie',
  // methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  // allowedHeaders: [
  //   'Access-Control-Allow-Origin',
  //   'Content-Type',
  //   'Authorization',
  // ],
};

export const setupServer = () => {
  const PORT = env(ENV_VARS.PORT, '3000');
  const app = express();

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(router);
  app.use('/', swaggerDocs());
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, (error) => {
    if (error) {
      console.log('Server crushed. error: ', error);
      process.exit(1);
    }
    console.log('Server is running on port', PORT);
    console.log();
  });
};
