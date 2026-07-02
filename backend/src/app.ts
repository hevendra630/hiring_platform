import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';

import { env } from '@config/env';
import { swaggerSpec } from '@config/swagger';
import apiRouter from '@routes/index';
import { notFoundHandler, errorHandler } from '@middlewares/error.middleware';
import { apiLimiter } from '@middlewares/rateLimiter.middleware';
import { logger } from '@utils/logger';

export function createApp(): Application {
  const app = express();

  // --- Security & parsing middleware ---
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize()); // strips $/. operators from req.body/query/params to prevent NoSQL injection

  // --- Logging ---
  app.use(
    morgan(env.isProd ? 'combined' : 'dev', {
      stream: { write: (msg: string) => logger.info(msg.trim()) },
    }),
  );

  // --- Rate limiting (applied to all /api routes) ---
  app.use(env.apiPrefix, apiLimiter);

  // --- API docs ---
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // --- Routes ---
  app.use(env.apiPrefix, apiRouter);

  // --- 404 + error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
