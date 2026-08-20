const app = require('./app');
const env = require('./config/env');
const { checkConnection } = require('./config/database');

/**
 * Bootstrap and start the backend service.
 */
async function startServer() {
  console.log('Starting eFocus Backend Server...');
  console.log(`Environment: ${env.nodeEnv}`);
  console.log('Verifying connection pool with database...');
  
  // Test connection to DB on start
  const dbConnected = await checkConnection();
  if (!dbConnected) {
    console.warn('WARNING: Running in degraded state because the database is currently unreachable.');
  }

  const server = app.listen(env.port, () => {
    console.log(`--------------------------------------------------`);
    console.log(`eFocus E-Commerce API is running on port: ${env.port}`);
    console.log(`Health endpoint: http://localhost:${env.port}/api/health`);
    console.log(`--------------------------------------------------`);
  });

  // Handle graceful shutdowns
  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});
