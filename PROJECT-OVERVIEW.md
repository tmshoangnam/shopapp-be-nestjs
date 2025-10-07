# ShopApp Backend - Tài liệu Tổng quan Dự án

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Kiến trúc Hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc Dự án](#cấu-trúc-dự-án)
- [Tính năng Đã Triển khai](#tính-năng-đã-triển-khai)
- [Công nghệ Sử dụng](#công-nghệ-sử-dụng)
- [Cơ sở Dữ liệu](#cơ-sở-dữ-liệu)
- [API Documentation](#api-documentation)
- [Vấn đề Cần Khắc phục](#vấn-đề-cần-khắc-phục)
- [Hướng dẫn Triển khai](#hướng-dẫn-triển-khai)
- [Roadmap](#roadmap)

---

## 🎯 Giới thiệu

**ShopApp Backend** là hệ thống quản lý salon làm đẹp được xây dựng với NestJS, cung cấp API đầy đủ cho việc quản lý đối tác, dịch vụ, lịch hẹn, đánh giá và các tính năng real-time.

### Đặc điểm chính:
- 🏗️ **Kiến trúc Modular**: Tổ chức code theo module rõ ràng
- 🔐 **Bảo mật Đa lớp**: JWT + OAuth (Google, Facebook, GitHub, LINE, Instagram)
- 📊 **Dashboard Analytics**: Thống kê và báo cáo chi tiết
- 🔄 **Real-time**: WebSocket cho chat và thông báo
- 📱 **Multi-platform**: Hỗ trợ web, mobile, admin panel
- 🚀 **High Performance**: Tối ưu database connections và queries

---

---

## 📁 Cấu trúc Dự án

```
src/
├── modules/                          # Feature modules
│   ├── auth/                        # Authentication & Authorization
│   │   ├── decorators/              # Custom decorators
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── guards/                  # Auth guards
│   │   └── strategies/              # OAuth strategies
│   ├── users/                       # User management
│   ├── partners/                    # Partner management
│   │   └── dto/                     # Partner DTOs
│   ├── services/                    # Beauty services
│   ├── appointments/                # Appointment booking
│   ├── reviews/                     # Review & rating system
│   ├── dashboard/                   # Analytics & statistics
│   │   └── dto/                     # Dashboard DTOs
│   ├── chat/                        # Real-time messaging
│   ├── notifications/               # Notification system
│   ├── file-upload/                 # File management
│   ├── prisma/                      # Database service
│   ├── logger/                      # Logging service
│   └── common/                      # Shared utilities
│       ├── config/                  # Configuration files
│       ├── interceptors/            # Global interceptors
│       └── pagination/              # Pagination system
│           ├── decorators/          # Pagination decorators
│           ├── dto/                 # Pagination DTOs
│           ├── interfaces/          # Type definitions
│           └── services/            # Pagination logic
├── app.module.ts                    # Root module
└── main.ts                          # Application entry point

prisma/
├── schema.prisma                    # Database schema
├── migrations/                      # Database migrations
└── seeds/                          # Seed data
    ├── index.ts                    # Main seed orchestrator
    ├── user.seed.ts                # User seed data
    └── partner.seed.ts             # Partner seed data

docs/
├── PROJECT-OVERVIEW.md             # This file
├── DATABASE-OPTIMIZATION.md        # Database optimization guide
└── API-DOCUMENTATION.md            # API documentation
```

---

## ✨ Tính năng Đã Triển khai

### 🔐 Authentication & Authorization
- ✅ **JWT Authentication**: Token-based auth với refresh token
- ✅ **OAuth Integration**: Google, Facebook, GitHub, LINE, Instagram
- ✅ **Role-based Access Control**: USER, STAFF, ADMIN, SUPER_ADMIN
- ✅ **Session Management**: Secure session handling
- ✅ **Password Hashing**: bcrypt với salt rounds

### 👥 User Management
- ✅ **User CRUD**: Create, Read, Update, Delete users
- ✅ **Profile Management**: Avatar, phone, personal info
- ✅ **Account Status**: Active/Inactive, Verified/Unverified
- ✅ **Last Login Tracking**: Monitor user activity

### 🤝 Partner Management
- ✅ **Partner CRUD**: Complete partner lifecycle
- ✅ **Partner Status**: ACTIVE, INACTIVE, SUSPENDED
- ✅ **Commission Management**: Configurable commission rates
- ✅ **Partner Statistics**: Revenue, appointments, services
- ✅ **Search & Filter**: Advanced partner filtering

### 💅 Beauty Services
- ✅ **Service CRUD**: Service management
- ✅ **Category System**: Service categorization
- ✅ **Pricing Management**: Flexible pricing structure
- ✅ **Service Status**: Active/Inactive services
- ✅ **Partner Association**: Link services to partners

### 📅 Appointment System
- ✅ **Appointment Booking**: Complete booking flow
- ✅ **Status Management**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
- ✅ **Date/Time Management**: Flexible scheduling
- ✅ **Notes System**: Appointment notes and comments
- ✅ **Staff Assignment**: Assign staff to appointments

### ⭐ Review & Rating
- ✅ **Review System**: 5-star rating system
- ✅ **Comment System**: Text reviews
- ✅ **Appointment Integration**: Link reviews to appointments
- ✅ **Service Rating**: Rate individual services

### 📊 Dashboard & Analytics
- ✅ **Comprehensive Stats**: Users, partners, services, appointments, revenue
- ✅ **Monthly Trends**: 12-month historical data
- ✅ **Top Performers**: Best partners and popular services
- ✅ **Revenue Analytics**: Financial reporting
- ✅ **Real-time Data**: Live statistics
- ✅ **Date Range Filtering**: Custom period analysis

### 💬 Real-time Chat
- ✅ **WebSocket Integration**: Socket.IO implementation
- ✅ **Message System**: Send/receive messages
- ✅ **Room Management**: Chat rooms and private messages
- ✅ **Read Status**: Message read tracking
- ✅ **Real-time Updates**: Live message delivery

### 🔔 Notification System
- ✅ **Multi-type Notifications**: Appointment, message, system updates
- ✅ **Read Status**: Notification read tracking
- ✅ **JSON Data**: Flexible notification payload
- ✅ **User-specific**: Targeted notifications

### 📁 File Management
- ✅ **AWS S3 Integration**: Cloud file storage
- ✅ **File Upload**: Multiple file types support
- ✅ **Metadata Tracking**: File size, type, upload date
- ✅ **User Association**: Link files to users

### 🔧 Common Services
- ✅ **Pagination System**: Generic, searchable, cursor-based
- ✅ **Logging**: Winston logger with multiple transports
- ✅ **Validation**: Class-validator integration
- ✅ **Error Handling**: Global exception filters
- ✅ **CORS Configuration**: Flexible cross-origin setup

---

## 🛠️ Công nghệ Sử dụng

### Backend Framework
- **NestJS 10.4.0**: Progressive Node.js framework
- **TypeScript 5.4.2**: Type-safe JavaScript
- **Node.js 20+**: Runtime environment

### Database & ORM
- **PostgreSQL**: Primary database
- **Prisma 6.0.0**: Type-safe ORM
- **Redis**: Caching and session storage

### Authentication
- **JWT**: JSON Web Tokens
- **Passport.js**: Authentication middleware
- **bcrypt**: Password hashing

### OAuth Providers
- **Google OAuth 2.0**
- **Facebook Login**
- **GitHub OAuth**
- **LINE Login**
- **Instagram Basic Display**

### Real-time & Communication
- **Socket.IO**: WebSocket implementation
- **WebSocket**: Real-time communication

### Cloud Services
- **AWS S3**: File storage
- **AWS SDK**: Cloud integration

### Documentation & Testing
- **Swagger/OpenAPI**: API documentation
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Development Tools
- **Docker**: Containerization
- **Docker Compose**: Multi-container setup
- **Winston**: Logging
- **Helmet**: Security headers
- **Compression**: Response compression

---

## 🗄️ Cơ sở Dữ liệu

### Database Schema Overview

```mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ Appointment : books
    User ||--o{ Review : writes
    User ||--o{ ChatMessage : sends
    User ||--o{ Notification : receives
    User ||--o{ File : uploads
    
    Partner ||--o{ Service : provides
    Partner ||--o{ Appointment : handles
    
    Service ||--o{ Appointment : booked_for
    Service ||--o{ Review : reviewed
    
    Appointment ||--o| Review : has
    
    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        string avatar
        string phone
        enum role
        string googleId UK
        string facebookId UK
        string githubId UK
        string lineId UK
        string instagramId UK
        boolean isActive
        boolean isVerified
        datetime lastLogin
        datetime createdAt
        datetime updatedAt
    }
    
    Partner {
        string id PK
        string name
        string description
        string email UK
        string phone
        string address
        string website
        string logo
        enum status
        decimal commissionRate
        datetime createdAt
        datetime updatedAt
    }
    
    Service {
        string id PK
        string name
        string description
        string category
        int duration
        decimal price
        string image
        boolean isActive
        string partnerId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Appointment {
        string id PK
        string userId FK
        string serviceId FK
        string partnerId FK
        string staffId
        datetime appointmentDate
        enum status
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Review {
        string id PK
        string userId FK
        string serviceId FK
        string appointmentId FK UK
        int rating
        string comment
        datetime createdAt
        datetime updatedAt
    }
```

### Key Features
- **UUID Primary Keys**: Globally unique identifiers
- **Soft Deletes**: Data preservation with status flags
- **Audit Trails**: CreatedAt, UpdatedAt timestamps
- **Indexes**: Optimized query performance
- **Foreign Key Constraints**: Data integrity
- **Enum Types**: Type-safe status fields

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:4001/api/v1
Production: https://api.shopapp.com/api/v1
```

### Swagger Documentation
```
Development: http://localhost:4001/api/docs
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### API Endpoints Overview

#### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - User logout
- `GET /auth/google` - Google OAuth
- `GET /auth/facebook` - Facebook OAuth
- `GET /auth/github` - GitHub OAuth
- `GET /auth/line` - LINE OAuth
- `GET /auth/instagram` - Instagram OAuth

#### Users (`/users`)
- `GET /users` - List users (Admin only)
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (Super Admin only)

#### Partners (`/partners`)
- `POST /partners` - Create partner (Admin only)
- `GET /partners` - List partners with pagination
- `GET /partners/:id` - Get partner details
- `GET /partners/:id/stats` - Get partner statistics
- `PATCH /partners/:id` - Update partner (Admin only)
- `DELETE /partners/:id` - Delete partner (Super Admin only)

#### Services (`/services`)
- `POST /services` - Create service
- `GET /services` - List services with pagination
- `GET /services/:id` - Get service details
- `PATCH /services/:id` - Update service
- `DELETE /services/:id` - Delete service

#### Appointments (`/appointments`)
- `POST /appointments` - Book appointment
- `GET /appointments` - List appointments with pagination
- `GET /appointments/:id` - Get appointment details
- `PATCH /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

#### Reviews (`/reviews`)
- `POST /reviews` - Create review
- `GET /reviews` - List reviews with pagination
- `GET /reviews/:id` - Get review details
- `PATCH /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

#### Dashboard (`/dashboard`)
- `GET /dashboard` - Get comprehensive statistics
- `GET /dashboard/quick` - Get quick stats

#### Chat (`/chat`)
- `WebSocket /chat` - Real-time messaging

#### Notifications (`/notifications`)
- `GET /notifications` - List user notifications
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

#### File Upload (`/files`)
- `POST /files/upload` - Upload file to S3
- `GET /files` - List user files
- `DELETE /files/:id` - Delete file

---

## ⚠️ Vấn đề Cần Khắc phục

### 🔴 Critical Issues

#### 1. Database Connection Optimization
- **Vấn đề**: "FATAL: sorry, too many clients already" khi gọi dashboard API
- **Nguyên nhân**: Dashboard service tạo quá nhiều connections đồng thời
- **Trạng thái**: ✅ **ĐÃ KHẮC PHỤC** - Sử dụng transaction và tối ưu queries
- **Giải pháp**: 
  - Sử dụng `$transaction` cho multiple queries
  - Gộp queries thành single operations
  - Cấu hình connection pooling

#### 2. Module Structure Inconsistency
- **Vấn đề**: Một số modules chưa được di chuyển vào `src/modules/`
- **Trạng thái**: ✅ **ĐÃ KHẮC PHỤC** - Tất cả modules đã được tổ chức lại
- **Giải pháp**: Di chuyển tất cả modules vào `src/modules/` structure

### 🟡 Medium Priority Issues

#### 3. Missing Health Check Module
- **Vấn đề**: Không có health check endpoints
- **Trạng thái**: ✅ **ĐÃ KHẮC PHỤC** - Đã tạo health check module
- **Giải pháp**: Tạo health check endpoints cho monitoring

#### 4. Incomplete Error Handling
- **Vấn đề**: Một số services chưa có error handling đầy đủ
- **Trạng thái**: 🔄 **ĐANG XỬ LÝ** - Cần review và cải thiện
- **Giải pháp**: 
  - Thêm try-catch blocks
  - Custom exception classes
  - Global exception filters

#### 5. Missing Input Validation
- **Vấn đề**: Một số DTOs chưa có validation đầy đủ
- **Trạng thái**: 🔄 **ĐANG XỬ LÝ** - Cần bổ sung validation rules
- **Giải pháp**:
  - Thêm class-validator decorators
  - Custom validation pipes
  - Input sanitization

### 🟢 Low Priority Issues

#### 6. Missing Unit Tests
- **Vấn đề**: Chưa có unit tests cho các services
- **Trạng thái**: ❌ **CHƯA XỬ LÝ**
- **Giải pháp**: Tạo test suites với Jest

#### 7. Missing Integration Tests
- **Vấn đề**: Chưa có integration tests cho API endpoints
- **Trạng thái**: ❌ **CHƯA XỬ LÝ**
- **Giải pháp**: Tạo e2e tests với Supertest

#### 8. Missing API Rate Limiting
- **Vấn đề**: Chưa có rate limiting cho API
- **Trạng thái**: ❌ **CHƯA XỬ LÝ**
- **Giải pháp**: Implement rate limiting middleware

#### 9. Missing Caching Strategy
- **Vấn đề**: Chưa có caching cho frequently accessed data
- **Trạng thái**: ❌ **CHƯA XỬ LÝ**
- **Giải pháp**: Implement Redis caching

#### 10. Missing API Versioning
- **Vấn đề**: Chưa có API versioning strategy
- **Trạng thái**: ❌ **CHƯA XỬ LÝ**
- **Giải pháp**: Implement API versioning

---

## 🚀 Hướng dẫn Triển khai

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- AWS S3 account
- Docker & Docker Compose (optional)

### Environment Setup
1. **Clone repository**
```bash
git clone <repository-url>
cd shopapp-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed data
npm run db:seed
```

5. **Start development server**
```bash
npm run start:dev
```

### Docker Deployment
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build application
npm run build

# Start production server
npm run start:prod
```

---

## 🗺️ Roadmap

### Phase 1: Core Features (✅ Completed)
- [x] Authentication & Authorization
- [x] User Management
- [x] Partner Management
- [x] Service Management
- [x] Appointment System
- [x] Review System
- [x] Dashboard Analytics
- [x] Real-time Chat
- [x] Notification System
- [x] File Upload

### Phase 2: Optimization & Stability (🔄 In Progress)
- [x] Database Connection Optimization
- [x] Module Structure Reorganization
- [x] Health Check System
- [ ] Error Handling Improvement
- [ ] Input Validation Enhancement
- [ ] API Rate Limiting
- [ ] Caching Strategy

### Phase 3: Testing & Quality (📋 Planned)
- [ ] Unit Tests (Jest)
- [ ] Integration Tests (Supertest)
- [ ] E2E Tests
- [ ] Performance Testing
- [ ] Security Testing

### Phase 4: Advanced Features (📋 Planned)
- [ ] API Versioning
- [ ] Advanced Analytics
- [ ] Reporting System
- [ ] Email Notifications
- [ ] SMS Notifications
- [ ] Push Notifications
- [ ] Multi-language Support
- [ ] Audit Logging

### Phase 5: Scalability (📋 Planned)
- [ ] Microservices Architecture
- [ ] Load Balancing
- [ ] Database Sharding
- [ ] CDN Integration
- [ ] Monitoring & Alerting
- [ ] Auto-scaling

---

## 📞 Support & Contact

### Development Team
- **Lead Developer**: PhiLV
- **Email**: support@shopapp.com
- **Documentation**: [API Docs](http://localhost:4001/api/docs)

### Resources
- **Repository**: [GitHub Repository]
- **Documentation**: [Project Wiki]
- **Issue Tracking**: [GitHub Issues]
- **API Testing**: [Postman Collection]

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NestJS Team** - For the amazing framework
- **Prisma Team** - For the excellent ORM
- **PostgreSQL Team** - For the robust database
- **Open Source Community** - For the amazing tools and libraries

---

*Last updated: January 2025*
*Version: 1.0.0*
