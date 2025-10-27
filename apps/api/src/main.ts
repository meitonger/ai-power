// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { yoga } from './graphql';
import { createServer } from 'http';

function readOrigins(): (string | RegExp)[] {
  const raw = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure ALL routes are served under /api (so web's /api/* calls work)
  app.setGlobalPrefix('api');

  // Enable CORS so the web (3000) can call the API (3001)
  app.enableCors({
    origin: readOrigins(),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  // Create raw Node server for GraphQL Yoga
  const expressApp = app.getHttpAdapter().getInstance();
  const server = createServer(expressApp);

  // Mount GraphQL Yoga on /api/graphql
  expressApp.use('/api/graphql', yoga);

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.init(); // Init Nest app, but do NOT use app.listen()
  server.listen(port, () => {
    console.log(`✅ API + GraphQL ready at http://localhost:${port}/api`);
  });
}
bootstrap();
