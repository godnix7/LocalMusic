import { FastifyInstance } from 'fastify';

export const musicRoutes = async (app: FastifyInstance) => {
  app.get('/search', async (request, reply) => {
    return { results: [] };
  });

  app.get('/stream/:id', async (request, reply) => {
    return { url: 'streaming-url' };
  });

  app.get('/trending', async (request, reply) => {
    return { tracks: [] };
  });
};
