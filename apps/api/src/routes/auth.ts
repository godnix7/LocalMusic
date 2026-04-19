import { FastifyInstance } from 'fastify';

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/login', async (request, reply) => {
    return { message: 'Login endpoint' };
  });

  app.post('/register', async (request, reply) => {
    return { message: 'Register endpoint' };
  });
};
