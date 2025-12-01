import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ 
  logger: true 
});

// Enable CORS
await fastify.register(cors, {
  origin: true
});

// Health check route
fastify.get('/api/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ft_transcendence-backend'
  };
});

// Test route
fastify.get('/api/hello', async () => {
  return { 
    message: 'Hello from ft_transcendence backend! 🚀' 
  };
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Backend running on port 4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
