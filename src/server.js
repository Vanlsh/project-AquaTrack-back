import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './utils/env.js';
import { ENV_VARS } from './constants/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import router from './routers/index.js';

// const allowedOrigins = [env(ENV_VARS.APP_DOMAIN), 'http://localhost:5173'];

export const setupServer = () => {
  const PORT = env(ENV_VARS.PORT, '3000');
  const app = express();

  // const corsOptions = {
  //   origin: (origin, callback) => {
  //     if (allowedOrigins.includes(origin) || !origin) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   credentials: true,
  // };

  app.use(cors());
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
