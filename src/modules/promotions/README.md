# Promotions Module

## Overview

The Promotions Module provides comprehensive functionality for managing promotional campaigns in the NestJS backend system. This module handles creation, validation, application, and tracking of various types of promotions including percentage discounts, fixed amount discounts, free shipping, and buy-X-get-Y offers.

## Features

- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for promotions
- **Multiple Promotion Types**: Support for percentage, fixed amount, free shipping, and buy-X-get-Y promotions
- **Target Constraints**: Ability to target specific users, services, partners, or categories
- **Usage Tracking**: Comprehensive tracking of promotion usage and statistics
- **Validation System**: Robust validation for promotion codes and eligibility
- **Time-based Controls**: Start and end date management for campaigns
- **Usage Limits**: Per-promotion and per-user usage limits
- **Statistics & Analytics**: Detailed usage statistics and performance metrics

## Architecture

The module follows the standard NestJS architecture pattern with clear separation of concerns:

```
src/modules/promotions/
├── entities/              # Domain entities
├── dto/                   # Data Transfer Objects
├── interfaces/            # Service and repository interfaces
├── mappers/               # Entity-DTO mapping utilities
├── promotions.controller.ts # HTTP endpoints
├── promotions.service.ts   # Business logic
├── promotions.repository.ts # Data access layer
├── promotions.module.ts    # Module configuration
└── README.md              # Documentation
```

## API Endpoints

### Promotion Management

- `POST /promotions` - Create a new promotion
- `GET /promotions` - Get all promotions (with pagination and filtering)
- `GET /promotions/:id` - Get promotion by ID
- `PATCH /promotions/:id` - Update promotion
- `DELETE /promotions/:id` - Delete promotion
- `PATCH /promotions/:id/activate` - Activate promotion
- `PATCH /promotions/:id/deactivate` - Deactivate promotion

### Promotion Operations

- `POST /promotions/validate` - Validate promotion code
- `POST /promotions/apply` - Apply promotion to an order
- `POST /promotions/available` - Get available promotions for user
- `GET /promotions/:id/stats` - Get promotion statistics

## Data Models

### Promotion Types

- **PERCENTAGE**: Percentage-based discount (e.g., 20% off)
- **FIXED_AMOUNT**: Fixed amount discount (e.g., 50,000 VND off)
- **FREE_SHIPPING**: Free shipping offer
- **BUY_X_GET_Y**: Buy X items get Y free

### Promotion Targets

- **ALL**: Available for all users
- **USER**: Specific users only
- **SERVICE**: Specific services only
- **PARTNER**: Specific partners only
- **CATEGORY**: Service categories only

## Usage Examples

### Creating a Promotion

```typescript
const createPromotionDto: CreatePromotionDto = {
  code: 'SUMMER2024',
  name: 'Summer Sale 2024',
  description: 'Get 20% off on all beauty services',
  type: PromotionType.PERCENTAGE,
  value: 20,
  minOrderAmount: 500000,
  maxDiscountAmount: 200000,
  usageLimit: 1000,
  userUsageLimit: 2,
  startDate: '2024-06-01T00:00:00.000Z',
  endDate: '2024-08-31T23:59:59.000Z',
  targetType: PromotionTarget.ALL,
};

const promotion = await promotionsService.create(createPromotionDto);
```

### Validating a Promotion

```typescript
const validation = await promotionsService.validatePromotion(
  'SUMMER2024',
  userId,
  600000 // order amount
);

if (validation.isValid) {
  console.log(`Discount: ${validation.discountAmount} VND`);
  console.log(`Final amount: ${validation.finalAmount} VND`);
}
```

### Applying a Promotion

```typescript
const result = await promotionsService.applyPromotion(
  'SUMMER2024',
  userId,
  bookingId,
  600000 // order amount
);

if (result.success) {
  console.log('Promotion applied successfully');
  console.log(`Usage ID: ${result.usage?.id}`);
}
```

## Business Logic

### Promotion Validation Rules

1. **Active Status**: Promotion must be active
2. **Date Validity**: Current date must be within start and end dates
3. **Usage Limits**: Total usage must not exceed limit
4. **User Limits**: User usage must not exceed per-user limit
5. **Minimum Order**: Order amount must meet minimum requirement
6. **Target Constraints**: User/service must be in target list (if applicable)

### Discount Calculation

- **Percentage**: `discount = (orderAmount * percentage) / 100`
- **Fixed Amount**: `discount = fixedAmount`
- **Maximum Limit**: If set, discount cannot exceed maxDiscountAmount
- **Order Amount**: Discount cannot exceed order amount

## Integration Points

### With Booking Module

Promotions can be applied to bookings during the booking process:

```typescript
// In booking service
const promotionResult = await this.promotionsService.applyPromotion(
  promotionCode,
  userId,
  booking.id,
  booking.totalAmount
);

if (promotionResult.success) {
  booking.discountAmount = promotionResult.discountAmount;
  booking.finalAmount = promotionResult.finalAmount;
}
```

### With User Module

User-specific promotions can be targeted:

```typescript
const userPromotions = await this.promotionsService.getAvailablePromotions(
  userId,
  orderAmount
);
```

### With Service/Partner Module

Service or partner-specific promotions:

```typescript
const servicePromotions = await this.promotionsRepository.findPromotionsByTarget(
  PromotionTarget.SERVICE,
  [serviceId]
);
```

## Configuration

### Environment Variables

No specific environment variables are required for this module, but it depends on:

- Database connection (via PrismaModule)
- Redis connection (for caching, optional)

### Database Schema

The module uses the following Prisma models:

- `Promotion`: Main promotion entity
- `PromotionUsage`: Usage tracking entity
- `PromotionType`: Enum for promotion types
- `PromotionTarget`: Enum for target types

## Testing

### Unit Tests

```bash
# Run promotion module tests
npm run test src/modules/promotions

# Run with coverage
npm run test:cov src/modules/promotions
```

### Integration Tests

```bash
# Run integration tests
npm run test:e2e -- --testPathPattern=promotions
```

## Performance Considerations

1. **Database Indexes**: Proper indexes are created for frequently queried fields
2. **Pagination**: All list endpoints support pagination
3. **Caching**: Repository layer can be extended with Redis caching
4. **Validation Caching**: Promotion validation results can be cached

## Security Considerations

1. **Input Validation**: All inputs are validated using class-validator
2. **Authorization**: Endpoints should be protected with appropriate guards
3. **Rate Limiting**: Consider rate limiting for promotion application endpoints
4. **Audit Logging**: All promotion operations are logged for audit purposes

## Monitoring & Analytics

The module provides comprehensive statistics:

- Total usage count
- Total discount given
- Total revenue generated
- Unique users
- Conversion rates
- Average order values

## Future Enhancements

1. **Promotion Codes**: Generate unique codes for each user
2. **A/B Testing**: Support for promotion variants
3. **Automated Campaigns**: Time-based promotion activation
4. **Advanced Targeting**: Complex targeting rules
5. **Promotion Bundles**: Multiple promotions in one campaign
6. **Real-time Analytics**: Live usage tracking and dashboards

## Troubleshooting

### Common Issues

1. **Promotion Not Found**: Check if promotion code exists and is active
2. **Validation Failed**: Verify all validation rules are met
3. **Usage Limit Exceeded**: Check total and per-user usage limits
4. **Date Issues**: Ensure current date is within promotion period

### Debug Mode

Enable debug logging by setting the appropriate log level in your environment configuration.

## Support

For issues or questions regarding the Promotions Module, please refer to:

1. This documentation
2. API documentation (Swagger)
3. Code comments and JSDoc
4. Team lead or senior developers
