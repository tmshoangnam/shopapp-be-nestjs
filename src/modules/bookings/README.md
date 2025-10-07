# Bookings Module

## Overview

The Bookings Module is a comprehensive booking management system built following Hexagonal Architecture principles. It provides a complete solution for managing service bookings, including creation, updates, cancellations, and status tracking.

## Architecture

This module follows the **Hexagonal Architecture** pattern with clear separation of concerns:

```
src/modules/bookings/
├── bookings.controller.ts      # API endpoints (Presentation Layer)
├── bookings.service.ts         # Business logic (Application Layer)
├── bookings.repository.ts      # Data access (Infrastructure Layer)
├── bookings.module.ts          # Module configuration
├── dto/                        # Data Transfer Objects
│   ├── create-booking.dto.ts
│   ├── update-booking.dto.ts
│   ├── booking-response.dto.ts
│   ├── query-booking.dto.ts
│   ├── cancel-booking.dto.ts
│   └── index.ts
├── entities/                   # Domain entities
│   ├── booking.entity.ts
│   └── index.ts
├── interfaces/                 # Service contracts
│   ├── booking-repository.interface.ts
│   ├── booking-service.interface.ts
│   └── index.ts
├── mappers/                    # Data transformation
│   ├── booking.mapper.ts
│   └── index.ts
└── README.md                   # This file
```

## Features

### Core Functionality
- ✅ **Create Bookings**: Create new service bookings with validation
- ✅ **Update Bookings**: Modify existing bookings with business rules
- ✅ **Cancel Bookings**: Cancel bookings with reason tracking
- ✅ **Status Management**: Track booking lifecycle (Pending → Confirmed → In Progress → Completed)
- ✅ **Payment Integration**: Handle payment status and methods
- ✅ **Availability Checking**: Real-time availability validation
- ✅ **Search & Filtering**: Advanced query capabilities
- ✅ **Pagination**: Efficient data retrieval
- ✅ **Statistics**: Booking analytics and reporting

### Business Rules
- **Date Validation**: Bookings cannot be made for past dates
- **Time Validation**: End time must be after start time
- **Availability Check**: Prevents double-booking conflicts
- **Amount Validation**: Ensures correct pricing calculations
- **Status Transitions**: Enforces proper booking state changes
- **Payment Rules**: Prevents modifications to paid bookings

## API Endpoints

### Booking Management

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/bookings` | Create new booking | ✅ | User |
| `GET` | `/bookings` | Get all bookings (with filters) | ✅ | User |
| `GET` | `/bookings/:id` | Get booking by ID | ✅ | User |
| `PATCH` | `/bookings/:id` | Update booking | ✅ | User |
| `DELETE` | `/bookings/:id` | Delete booking | ✅ | Admin+ |

### Booking Actions

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `PATCH` | `/bookings/:id/cancel` | Cancel booking | ✅ | User |
| `PATCH` | `/bookings/:id/confirm` | Confirm booking | ✅ | Staff+ |
| `PATCH` | `/bookings/:id/complete` | Complete booking | ✅ | Staff+ |

### Query Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/bookings/user/:userId` | Get user's bookings | ✅ | User |
| `GET` | `/bookings/service/:serviceId` | Get service bookings | ✅ | User |
| `GET` | `/bookings/partner/:partnerId` | Get partner bookings | ✅ | User |
| `GET` | `/bookings/statistics` | Get booking statistics | ✅ | User |
| `GET` | `/bookings/availability` | Check availability | ✅ | User |

## Data Models

### Booking Entity

```typescript
interface BookingEntity {
  id: string;
  userId: string;
  serviceId: string;
  partnerId?: string;
  staffId?: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: UserInfo;
  service?: ServiceInfo;
  partner?: PartnerInfo;
  payments?: PaymentInfo[];
}
```

### Booking Status Flow

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
    ↓         ↓           ↓
CANCELLED  CANCELLED  CANCELLED
    ↓
NO_SHOW
    ↓
REFUNDED
```

### Payment Status Flow

```
PENDING → PROCESSING → COMPLETED
    ↓         ↓
FAILED    FAILED
    ↓
REFUNDED
```

## Usage Examples

### Create a Booking

```typescript
const createBookingDto: CreateBookingDto = {
  userId: 'user-123',
  serviceId: 'service-456',
  partnerId: 'partner-789',
  bookingDate: '2024-01-15T00:00:00Z',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T11:00:00Z',
  totalAmount: 150000,
  discountAmount: 15000,
  finalAmount: 135000,
  paymentMethod: 'card',
  notes: 'Please call before arrival'
};

const booking = await bookingsService.create(createBookingDto);
```

### Query Bookings

```typescript
const queryDto: QueryBookingDto = {
  page: 1,
  limit: 10,
  status: BookingStatus.CONFIRMED,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  sortBy: 'bookingDate',
  sortOrder: 'asc'
};

const result = await bookingsService.findAll(queryDto);
```

### Check Availability

```typescript
const isAvailable = await bookingsService.checkAvailability(
  'service-123',
  new Date('2024-01-15T10:00:00Z'),
  new Date('2024-01-15T11:00:00Z')
);
```

## Error Handling

The module provides comprehensive error handling with specific exception types:

- **`NotFoundException`**: Booking not found
- **`BadRequestException`**: Validation errors, invalid operations
- **`ConflictException`**: Time slot conflicts, business rule violations

### Common Error Scenarios

```typescript
// Past date booking
throw new BadRequestException('Booking date cannot be in the past');

// Time slot conflict
throw new ConflictException('Time slot is not available for booking');

// Invalid amount calculation
throw new BadRequestException('Final amount must equal total amount minus discount amount');

// Invalid status transition
throw new BadRequestException('Only pending bookings can be confirmed');
```

## Dependencies

### Internal Dependencies
- `PrismaModule`: Database access
- `AuthModule`: Authentication and authorization

### External Dependencies
- `@nestjs/common`: Core NestJS functionality
- `@nestjs/swagger`: API documentation
- `class-validator`: DTO validation
- `class-transformer`: Data transformation
- `@prisma/client`: Database client

## Configuration

The module is configured in `bookings.module.ts` with proper dependency injection:

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsRepository,
    {
      provide: 'IBookingService',
      useClass: BookingsService,
    },
    {
      provide: 'IBookingRepository',
      useClass: BookingsRepository,
    },
  ],
  exports: [
    BookingsService,
    BookingsRepository,
    'IBookingService',
    'IBookingRepository',
  ],
})
export class BookingsModule {}
```

## Best Practices

### Code Organization
- **Single Responsibility**: Each class has one clear purpose
- **Dependency Injection**: Proper DI configuration for testability
- **Interface Segregation**: Clear contracts between layers
- **Data Validation**: Comprehensive input validation

### Performance
- **Pagination**: Efficient data retrieval for large datasets
- **Selective Queries**: Only fetch required fields
- **Indexed Queries**: Optimized database queries
- **Caching Ready**: Structure supports caching implementation

### Security
- **Authentication**: All endpoints require valid JWT
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Prevention**: Prisma ORM protection

## Testing

While unit tests are not included in this template, the module is designed for easy testing:

- **Service Layer**: Business logic can be unit tested with mocked repository
- **Controller Layer**: API endpoints can be tested with supertest
- **Repository Layer**: Database operations can be tested with test database

## Future Enhancements

### Planned Features
- **Email Notifications**: Automated booking confirmations
- **SMS Reminders**: Appointment reminders
- **Calendar Integration**: Sync with external calendars
- **Payment Gateway**: Direct payment processing
- **Recurring Bookings**: Repeat booking functionality
- **Waitlist Management**: Queue system for popular time slots

### Scalability Considerations
- **Event Sourcing**: Track all booking state changes
- **CQRS**: Separate read/write models for performance
- **Microservices**: Split into dedicated booking service
- **Message Queues**: Async processing for heavy operations

## Contributing

When extending this module:

1. **Follow Architecture**: Maintain hexagonal architecture principles
2. **Add Validation**: Include comprehensive DTO validation
3. **Update Documentation**: Keep README and API docs current
4. **Error Handling**: Provide clear error messages
5. **Testing**: Add unit tests for new functionality

## License

This module is part of the NestJS Backend project and follows the same licensing terms.
