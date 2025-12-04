import Fastify from 'fastify';
import cors from '@fastify/cors';
import { FastifyApp } from './fastify';



// // Health check route
// fastifyApp.instance.get('/api/health', async () => {
//   return { 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'ft_transcendence-backend'
//   };
// });

// // Test route
// fastifyApp.instance.get('/api/hello', async () => {
//   return { 
//     message: 'Hello from ft_transcendence backend! 🚀' 
//   };
// });

const start = async () => {
  const fastifyApp = new FastifyApp();
  try {
    await fastifyApp.initialize();
    await fastifyApp.listen();
  } catch (err) {
    fastifyApp.instance.log.error(err);
    process.exit(1);
  }
};

start();
