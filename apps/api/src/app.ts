import fastify from 'fastify';
import cors from '@fastify/cors';
import { musicRoutes } from './routes/music';
import { authRoutes } from './routes/auth';
import db from './plugins/db';

export const buildApp = async () => {
  const app = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
      },
    },
  });

  // Plugins
  await app.register(cors, {
    origin: true, // Configure properly in production
  });
  await app.register(db);

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(musicRoutes, { prefix: '/api/music' });

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
};
