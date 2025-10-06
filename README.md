# ShopApp Backend API

Backend API cho ?ng d?ng ShopApp du?c xây d?ng v?i NestJS, PostgreSQL, và Prisma.

## ?? Tech Stack

- **Framework**: NestJS v11.x
- **Runtime**: Node.js v20 LTS
- **Database**: PostgreSQL 17.1
- **ORM**: Prisma v6
- **Authentication**: JWT + OAuth 2.0 (Google, Facebook, GitHub)
- **File Storage**: AWS S3
- **Real-time**: Socket.IO v4.x
- **Caching**: Redis v7

## ?? Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## ??? Database Setup

1. Cài d?t PostgreSQL 17.1
2. T?o database:
```sql
CREATE DATABASE ShopApp;
```

3. C?p nh?t DATABASE_URL trong file .env:
```
DATABASE_URL="postgresql://username:password@localhost:5432/ShopApp?schema=public"
```

4. Ch?y migrations:
```bash
npm run prisma:migrate
```

5. (Optional) M? Prisma Studio d? xem database:
```bash
npm run prisma:studio
```

## ?? Configuration

C?u hình các bi?n môi tru?ng trong file `.env`:

### Required Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key cho JWT
- `AWS_*`: AWS S3 credentials
- `REDIS_*`: Redis connection details

### OAuth Configuration:
- Google, Facebook, GitHub OAuth credentials

## ?? Running the app

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

API s? ch?y t?i: `http://localhost:4000/api/v1`

## ?? Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## ?? Project Structure

```
src/
+-- auth/                 # Authentication & Authorization
¦   +-- guards/          # JWT guards
¦   +-- strategies/      # Passport strategies
¦   +-- dto/            # Auth DTOs
+-- users/               # User management
+-- chat/                # Real-time chat (Socket.IO)
+-- file-upload/         # File upload to S3
+-- prisma/              # Prisma service
+-- main.ts             # Application entry point
```

## ?? Authentication

### JWT Authentication
- Access Token: 15 phút
- Refresh Token: 7 ngày

### OAuth 2.0 Providers
- Google OAuth
- Facebook OAuth  
- GitHub OAuth

## ?? API Endpoints

### Auth
- `POST /api/v1/auth/register` - Ðang ký
- `POST /api/v1/auth/login` - Ðang nh?p
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/facebook` - Facebook OAuth
- `GET /api/v1/auth/github` - GitHub OAuth

### Users
- `GET /api/v1/users/me` - L?y thông tin user hi?n t?i
- `PUT /api/v1/users/me` - C?p nh?t thông tin
- `GET /api/v1/users/:id` - L?y thông tin user theo ID

### File Upload
- `POST /api/v1/files/upload` - Upload file lên S3
- `DELETE /api/v1/files/:id` - Xóa file

### Chat (WebSocket)
- `ws://localhost:4000` - WebSocket connection
- Events: `message`, `join-room`, `leave-room`

## ?? Database Migrations

```bash
# Create new migration
npm run prisma:migrate

# Apply migrations
npm run prisma:push

# Reset database (DEV only)
npx prisma migrate reset
```

## ?? Additional Scripts

```bash
# Format code
npm run format

# Lint code
npm run lint

# Prisma Studio (Database GUI)
npm run prisma:studio
```

## ?? CORS Configuration

CORS du?c c?u hình d? cho phép frontend (m?c d?nh: `http://localhost:3000`) k?t n?i.

## ??? Security Features

- Helmet.js cho HTTP headers security
- CORS protection
- Request validation v?i class-validator
- JWT v?i expiration
- Password hashing v?i bcrypt
- Rate limiting (TODO)

## ?? License

MIT

## ????? Author

PhiLV - ShopApp Team
