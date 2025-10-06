import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const createCorsConfig = (configService: ConfigService): CorsOptions => {
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  const baseOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:4001',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://localhost:5173',
    'https://localhost:8080',
    'https://localhost:4001',
  ];

  const productionOrigins = [
    configService.get('FRONTEND_URL'),
    configService.get('ADMIN_FRONTEND_URL'),
    configService.get('MOBILE_APP_URL'),
  ].filter(Boolean);

  const allowedOrigins = isProduction
    ? productionOrigins
    : [...baseOrigins, ...productionOrigins];

  return {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (isDevelopment && origin.includes('localhost')) {
        return callback(null, true);
      }

      if (isDevelopment && origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      if (isDevelopment && (origin.includes('dev') || origin.includes('test'))) {
        return callback(null, true);
      }

      console.warn(`🚫 CORS blocked origin: ${origin}`);

      if (isDevelopment) {
        console.warn(`⚠️  Allowing blocked origin in development mode`);
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },

    credentials: true,

    methods: [
      'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD',
    ],

    allowedHeaders: [
      'Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With',
      'Access-Control-Request-Method', 'Access-Control-Request-Headers',
      'Cache-Control', 'Pragma', 'Expires', 'X-API-Key', 'X-Client-Version',
      'X-Platform', 'X-Device-ID',
    ],

    exposedHeaders: [
      'Content-Length', 'Content-Type', 'X-Total-Count', 'X-Page', 'X-Limit',
      'X-Total-Pages', 'X-Request-ID', 'X-Response-Time',
    ],

    optionsSuccessStatus: 200,
    maxAge: isProduction ? 86400 : 0,
    preflightContinue: false,
  };
};

export const simpleCorsConfig: CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const strictCorsConfig = (configService: ConfigService): CorsOptions => ({
  origin: [
    configService.get('FRONTEND_URL'),
    configService.get('ADMIN_FRONTEND_URL'),
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});
