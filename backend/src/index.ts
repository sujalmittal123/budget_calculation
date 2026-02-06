import 'dotenv/config';
import { createServer } from './server.js';
import { connectDatabase } from '@config/database';
import { env } from '@config/env';

async function bootstrap() {
  try {
    console.log('🚀 Starting Budget Tracker API...');
    console.log(`📍 Environment: ${env.NODE_ENV}`);

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createServer();

    // Start server
    app.listen(env.PORT, () => {
      console.log(`✅ Server running on port ${env.PORT}`);
      console.log(`📍 API: http://localhost:${env.PORT}/api`);
      console.log(`📍 Auth: http://localhost:${env.PORT}/api/auth`);
      console.log(`📍 Health: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
