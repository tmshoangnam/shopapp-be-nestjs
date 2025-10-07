# Bookings Module Architecture

## Hexagonal Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  BookingsController                                             │
│  ├── POST /bookings (create)                                   │
│  ├── GET /bookings (findAll)                                   │
│  ├── GET /bookings/:id (findById)                              │
│  ├── PATCH /bookings/:id (update)                              │
│  ├── DELETE /bookings/:id (delete)                             │
│  ├── PATCH /bookings/:id/cancel (cancel)                       │
│  ├── PATCH /bookings/:id/confirm (confirm)                     │
│  ├── PATCH /bookings/:id/complete (complete)                   │
│  └── GET /bookings/statistics (getStatistics)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  BookingsService (IBookingService)                             │
│  ├── Business Logic                                            │
│  ├── Validation Rules                                          │
│  ├── Status Transitions                                        │
│  ├── Availability Checking                                     │
│  └── Error Handling                                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  BookingEntity                                                 │
│  ├── Domain Model                                              │
│  ├── Business Rules                                            │
│  └── State Management                                          │
│                                                                 │
│  DTOs                                                          │
│  ├── CreateBookingDto                                          │
│  ├── UpdateBookingDto                                          │
│  ├── BookingResponseDto                                        │
│  ├── QueryBookingDto                                           │
│  └── CancelBookingDto                                          │
│                                                                 │
│  Interfaces                                                    │
│  ├── IBookingService                                           │
│  └── IBookingRepository                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  BookingsRepository (IBookingRepository)                       │
│  ├── Database Operations                                       │
│  ├── Query Building                                            │
│  ├── Data Mapping                                              │
│  └── Transaction Management                                    │
│                                                                 │
│  BookingMapper                                                 │
│  ├── Entity ↔ DTO Conversion                                  │
│  ├── Prisma ↔ Domain Mapping                                  │
│  └── Data Transformation                                       │
│                                                                 │
│  PrismaService                                                 │
│  ├── Database Connection                                       │
│  ├── Query Execution                                           │
│  └── Transaction Support                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                           │
│  ├── bookings table                                            │
│  ├── payments table                                            │
│  ├── users table (relation)                                    │
│  ├── services table (relation)                                 │
│  └── partners table (relation)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Create Booking Flow
```
Client Request → Controller → Service → Repository → Database
     ↓              ↓          ↓          ↓           ↓
CreateBookingDto → Validation → Business → Data → Booking
     ↑              ↑          ↑          ↑      Creation
Response DTO ← Mapping ← Entity ← Mapping ← Result
```

### 2. Query Bookings Flow
```
Client Request → Controller → Service → Repository → Database
     ↓              ↓          ↓          ↓           ↓
QueryBookingDto → Validation → Business → Query → Results
     ↑              ↑          ↑          ↑      Building
PaginatedResult ← Mapping ← Entities ← Mapping ← Data
```

### 3. Update Booking Flow
```
Client Request → Controller → Service → Repository → Database
     ↓              ↓          ↓          ↓           ↓
UpdateBookingDto → Validation → Business → Update → Booking
     ↑              ↑          ↑          ↑      Operation
Updated Entity ← Mapping ← Entity ← Mapping ← Result
```

## Component Responsibilities

### Controller Layer
- **HTTP Request Handling**: Parse and validate incoming requests
- **Authentication**: Verify JWT tokens and user permissions
- **Authorization**: Check role-based access control
- **Response Formatting**: Transform data to API response format
- **Error Handling**: Catch and format exceptions

### Service Layer
- **Business Logic**: Implement booking business rules
- **Validation**: Validate business constraints
- **State Management**: Handle booking status transitions
- **Availability Logic**: Check time slot conflicts
- **Error Handling**: Throw appropriate business exceptions

### Repository Layer
- **Data Access**: Interact with database through Prisma
- **Query Building**: Construct complex database queries
- **Data Mapping**: Convert between database and domain models
- **Transaction Management**: Handle database transactions
- **Performance Optimization**: Efficient data retrieval

### Domain Layer
- **Entity Definition**: Core booking domain model
- **Business Rules**: Domain-specific validation rules
- **State Transitions**: Booking lifecycle management
- **Value Objects**: Immutable domain concepts

## Dependencies

### Internal Dependencies
```
BookingsModule
├── PrismaModule (Database access)
├── AuthModule (Authentication)
└── CommonModule (Shared utilities)
```

### External Dependencies
```
@nestjs/common (Core framework)
@nestjs/swagger (API documentation)
class-validator (DTO validation)
class-transformer (Data transformation)
@prisma/client (Database client)
```

## Design Patterns

### 1. Repository Pattern
- Abstracts data access logic
- Enables easy testing with mocks
- Provides consistent data interface

### 2. Dependency Injection
- Loose coupling between components
- Easy testing and mocking
- Configuration flexibility

### 3. Interface Segregation
- Clear contracts between layers
- Easy implementation swapping
- Better maintainability

### 4. Data Transfer Object (DTO)
- Input/output validation
- API contract definition
- Data transformation layer

### 5. Mapper Pattern
- Clean separation of concerns
- Reusable transformation logic
- Type-safe conversions

## Security Considerations

### Authentication
- JWT token validation on all endpoints
- User context extraction from tokens
- Session management

### Authorization
- Role-based access control (RBAC)
- Endpoint-level permissions
- Resource ownership validation

### Input Validation
- DTO validation with class-validator
- SQL injection prevention via Prisma
- XSS protection through sanitization

### Data Protection
- Sensitive data encryption
- Audit logging for changes
- GDPR compliance considerations

## Performance Optimizations

### Database
- Indexed queries for common filters
- Selective field retrieval
- Pagination for large datasets
- Connection pooling

### Caching Strategy
- Service-level caching for statistics
- Redis integration ready
- Query result caching
- Session caching

### Query Optimization
- Efficient join operations
- Batch operations where possible
- Lazy loading for relations
- Query result streaming

## Scalability Considerations

### Horizontal Scaling
- Stateless service design
- Database connection pooling
- Load balancer compatibility
- Microservice ready architecture

### Vertical Scaling
- Memory-efficient data structures
- CPU-optimized algorithms
- Resource monitoring
- Performance profiling

### Future Enhancements
- Event-driven architecture
- Message queue integration
- CQRS implementation
- Event sourcing support
