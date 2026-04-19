import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', async (request, reply) => {
    const data = registerSchema.parse(request.body);
    
    // Check if user exists
    const existing = await AuthService.validateUser(data.email);
    if (existing) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const passwordHash = await AuthService.hashPassword(data.password);
    const user = await AuthService.createUser({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    const token = AuthService.generateToken(user.id, user.role);
    return { user, token };
  });

  app.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);
    
    const user = await AuthService.validateUser(email);
    if (!user || !(await AuthService.comparePassword(password, user.passwordHash))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = AuthService.generateToken(user.id, user.role);
    return { user, token };
  });

  app.get('/me', {
    onRequest: [app.authenticate]
  }, async (request, reply) => {
    const user = await AuthService.validateUser(request.user.userId);
    return { user };
  });
};
