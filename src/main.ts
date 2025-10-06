import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './modules/common/interceptors/logging.interceptor';
import { createCorsConfig } from './modules/common/config/cors.config';

/**
 * Bootstrap function to initialize and configure the NestJS application
 * Sets up middleware, validation, CORS, Swagger documentation, and logging
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Setup Winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  
  // Compression middleware
  app.use(compression());
  
  // Cookie parser
  app.use(cookieParser());

  // CORS configuration
  const corsOptions = createCorsConfig(configService);
  app.enableCors(corsOptions);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('ShopApp API')
    .setDescription('Beauty salon management system API documentation with OAuth support (Google, Facebook, GitHub, LINE, Instagram)')
    .setVersion('1.0.0')
    .setContact(
      'ShopApp Team',
      'https://shopapp.com',
      'support@shopapp.com',
    )
    .addTag('Auth', 'Authentication endpoints - Support Google, Facebook, GitHub, LINE, Instagram OAuth')
    .addTag('Users', 'User management endpoints')
    .addTag('Partners', 'Partner management endpoints')
    .addTag('Services', 'Beauty services management')
    .addTag('Appointments', 'Appointment booking and management')
    .addTag('Reviews', 'Service reviews and ratings')
    .addTag('Notifications', 'User notifications')
    .addTag('Dashboard', 'Dashboard statistics and analytics')
    .addTag('Files', 'File upload and management')
    .addTag('Chat', 'Real-time chat (WebSocket)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:4001', 'Development server')
    .addServer('https://api.shopapp.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'ShopApp API Documentation',
    customfavIcon: 'https://shopapp.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #e91e63; }
    `,
  });

  const port = configService.get('PORT') || 4000;
  await app.listen(port);

  logger.log(`🚀 ShopApp Backend API is running!`, 'Bootstrap');
  logger.log(`📡 Server: http://localhost:${port}`, 'Bootstrap');
  logger.log(`🔗 API Base: http://localhost:${port}/api/v1`, 'Bootstrap');
  logger.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV') || 'development'}`, 'Bootstrap');
}

bootstrap();
