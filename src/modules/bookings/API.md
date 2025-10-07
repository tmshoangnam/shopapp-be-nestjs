# Bookings API Documentation

## Base URL
```
/api/bookings
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Booking date cannot be in the past",
    "End time must be after start time"
  ],
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/bookings"
}
```

## Endpoints

### 1. Create Booking

**POST** `/bookings`

Creates a new booking for a service.

#### Request Body
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "serviceId": "123e4567-e89b-12d3-a456-426614174001",
  "partnerId": "123e4567-e89b-12d3-a456-426614174002",
  "staffId": "123e4567-e89b-12d3-a456-426614174003",
  "bookingDate": "2024-01-15T00:00:00.000Z",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T11:00:00.000Z",
  "totalAmount": 150000,
  "discountAmount": 15000,
  "finalAmount": 135000,
  "paymentMethod": "card",
  "notes": "Please call before arrival"
}
```

#### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174004",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "serviceId": "123e4567-e89b-12d3-a456-426614174001",
  "partnerId": "123e4567-e89b-12d3-a456-426614174002",
  "staffId": "123e4567-e89b-12d3-a456-426614174003",
  "bookingDate": "2024-01-15T00:00:00.000Z",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T11:00:00.000Z",
  "status": "PENDING",
  "totalAmount": 150000,
  "discountAmount": 15000,
  "finalAmount": 135000,
  "paymentStatus": "PENDING",
  "paymentMethod": "card",
  "notes": "Please call before arrival",
  "createdAt": "2024-01-10T09:00:00.000Z",
  "updatedAt": "2024-01-10T09:00:00.000Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+84901234567"
  },
  "service": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Hair Cut & Style",
    "description": "Professional hair cutting and styling service",
    "category": "Hair Services",
    "duration": 60,
    "price": 150000,
    "image": "https://example.com/service-image.jpg"
  },
  "partner": {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "name": "Beauty Salon ABC",
    "email": "contact@beautysalon.com",
    "phone": "+84901234568",
    "address": "123 Main Street, District 1, HCMC"
  }
}
```

#### Status Codes
- `201` - Created successfully
- `400` - Bad request (validation failed)
- `409` - Conflict (time slot not available)
- `401` - Unauthorized
- `403` - Forbidden

---

### 2. Get All Bookings

**GET** `/bookings`

Retrieves all bookings with optional filtering and pagination.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search term |
| `userId` | string | No | Filter by user ID |
| `serviceId` | string | No | Filter by service ID |
| `partnerId` | string | No | Filter by partner ID |
| `staffId` | string | No | Filter by staff ID |
| `status` | string | No | Filter by status |
| `paymentStatus` | string | No | Filter by payment status |
| `startDate` | string | No | Start date for date range filter |
| `endDate` | string | No | End date for date range filter |
| `sortBy` | string | No | Field to sort by (default: createdAt) |
| `sortOrder` | string | No | Sort order: asc/desc (default: desc) |

#### Example Request
```
GET /bookings?page=1&limit=10&status=CONFIRMED&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

#### Response
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174004",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "serviceId": "123e4567-e89b-12d3-a456-426614174001",
      "status": "CONFIRMED",
      "bookingDate": "2024-01-15T00:00:00.000Z",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T11:00:00.000Z",
      "totalAmount": 150000,
      "finalAmount": 135000,
      "paymentStatus": "COMPLETED",
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-12T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Get Booking by ID

**GET** `/bookings/:id`

Retrieves a specific booking by its ID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID |

#### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174004",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "serviceId": "123e4567-e89b-12d3-a456-426614174001",
  "partnerId": "123e4567-e89b-12d3-a456-426614174002",
  "staffId": "123e4567-e89b-12d3-a456-426614174003",
  "bookingDate": "2024-01-15T00:00:00.000Z",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T11:00:00.000Z",
  "status": "CONFIRMED",
  "totalAmount": 150000,
  "discountAmount": 15000,
  "finalAmount": 135000,
  "paymentStatus": "COMPLETED",
  "paymentMethod": "card",
  "notes": "Please call before arrival",
  "createdAt": "2024-01-10T09:00:00.000Z",
  "updatedAt": "2024-01-12T14:30:00.000Z",
  "user": { ... },
  "service": { ... },
  "partner": { ... },
  "payments": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174005",
      "amount": 135000,
      "currency": "VND",
      "method": "card",
      "status": "COMPLETED",
      "transactionId": "txn_123456789",
      "gateway": "stripe",
      "createdAt": "2024-01-10T09:05:00.000Z"
    }
  ]
}
```

#### Status Codes
- `200` - Success
- `404` - Booking not found
- `401` - Unauthorized

---

### 4. Update Booking

**PATCH** `/bookings/:id`

Updates a specific booking.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID |

#### Request Body
```json
{
  "staffId": "123e4567-e89b-12d3-a456-426614174003",
  "startTime": "2024-01-15T10:30:00.000Z",
  "endTime": "2024-01-15T11:30:00.000Z",
  "notes": "Updated notes"
}
```

#### Response
Returns the updated booking object (same format as GET by ID).

#### Status Codes
- `200` - Updated successfully
- `400` - Bad request (update not allowed)
- `404` - Booking not found
- `409` - Conflict (time slot not available)

---

### 5. Cancel Booking

**PATCH** `/bookings/:id/cancel`

Cancels a specific booking.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID |

#### Request Body
```json
{
  "cancellationReason": "Customer requested cancellation due to schedule conflict",
  "notes": "Customer will reschedule for next week"
}
```

#### Response
Returns the cancelled booking object with updated status.

#### Status Codes
- `200` - Cancelled successfully
- `400` - Bad request (cancellation not allowed)
- `404` - Booking not found

---

### 6. Confirm Booking

**PATCH** `/bookings/:id/confirm`

Confirms a pending booking. (Staff/Admin only)

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID |

#### Response
Returns the confirmed booking object.

#### Status Codes
- `200` - Confirmed successfully
- `400` - Bad request (confirmation not allowed)
- `404` - Booking not found
- `403` - Forbidden (insufficient permissions)

---

### 7. Complete Booking

**PATCH** `/bookings/:id/complete`

Marks a booking as completed. (Staff/Admin only)

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID |

#### Response
Returns the completed booking object.

#### Status Codes
- `200` - Completed successfully
- `400` - Bad request (completion not allowed)
- `404` - Booking not found
- `403` - Forbidden (insufficient permissions)

---

### 8. Delete Booking

**DELETE** `/bookings/:id`

Deletes a specific booking. (Admin only)

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID |

#### Response
```json
{
  "message": "Booking deleted successfully"
}
```

#### Status Codes
- `200` - Deleted successfully
- `400` - Bad request (deletion not allowed)
- `404` - Booking not found
- `403` - Forbidden (insufficient permissions)

---

### 9. Get User's Bookings

**GET** `/bookings/user/:userId`

Retrieves all bookings for a specific user.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID |

#### Query Parameters
Same as "Get All Bookings" endpoint.

#### Response
Same format as "Get All Bookings" endpoint.

---

### 10. Get Service Bookings

**GET** `/bookings/service/:serviceId`

Retrieves all bookings for a specific service.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | string | Yes | Service ID |

#### Query Parameters
Same as "Get All Bookings" endpoint.

#### Response
Same format as "Get All Bookings" endpoint.

---

### 11. Get Partner Bookings

**GET** `/bookings/partner/:partnerId`

Retrieves all bookings for a specific partner.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `partnerId` | string | Yes | Partner ID |

#### Query Parameters
Same as "Get All Bookings" endpoint.

#### Response
Same format as "Get All Bookings" endpoint.

---

### 12. Get Booking Statistics

**GET** `/bookings/statistics`

Retrieves booking statistics and analytics.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `partnerId` | string | No | Filter by partner ID |

#### Response
```json
{
  "total": 100,
  "pending": 10,
  "confirmed": 20,
  "completed": 60,
  "cancelled": 10,
  "totalRevenue": 8100000
}
```

---

### 13. Check Availability

**GET** `/bookings/availability`

Checks if a time slot is available for booking.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | string | Yes | Service ID |
| `startTime` | string | Yes | Start time (ISO string) |
| `endTime` | string | Yes | End time (ISO string) |
| `excludeBookingId` | string | No | Booking ID to exclude from check |

#### Example Request
```
GET /bookings/availability?serviceId=123&startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T11:00:00Z
```

#### Response
```json
{
  "available": true
}
```

## Data Types

### BookingStatus
```typescript
enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
  REFUNDED = "REFUNDED"
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIAL_REFUND = "PARTIAL_REFUND"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Validation failed or invalid operation |
| `401` | Unauthorized - Invalid or missing JWT token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Business rule violation (e.g., time slot conflict) |
| `500` | Internal Server Error - Unexpected server error |

## Rate Limiting

- **Create/Update Operations**: 10 requests per minute per user
- **Read Operations**: 100 requests per minute per user
- **Admin Operations**: 50 requests per minute per admin

## Webhooks

The booking system supports webhooks for the following events:

- `booking.created` - New booking created
- `booking.updated` - Booking updated
- `booking.cancelled` - Booking cancelled
- `booking.confirmed` - Booking confirmed
- `booking.completed` - Booking completed

Webhook payload format:
```json
{
  "event": "booking.created",
  "data": {
    "booking": { ... },
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```
