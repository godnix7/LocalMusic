import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

// This is a placeholder for DB client initialization
export default fp(async (app: FastifyInstance) => {
  app.decorate('db', {
    // Add DB clients here (CockroachDB, Cassandra, etc.)
    pg: null, 
    cassandra: null,
    search: null,
  });
});
