
import '@models/index';
import { createApp } from './app';
import { env } from '@config/env';
import { connectDB, disconnectDB } from '@config/db';
import { redisConnection } from '@config/redis';
import { logger } from '@utils/logger';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`HireAI API listening on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`Swagger docs: http://localhost:${env.port}/api-docs`);
  });

  const { initSocket } = require('./socket');
  initSocket(server);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received - shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      redisConnection.disconnect();
      process.exit(0);
    });
    // Force-exit if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { error: (err as Error).message });
  process.exit(1);
});
