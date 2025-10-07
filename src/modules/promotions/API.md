# Promotions API Documentation

## Overview

This document provides detailed API documentation for the Promotions Module endpoints.

## Base URL

```
http://localhost:3000/promotions
```

## Authentication

All endpoints require authentication unless otherwise specified. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Promotion

Creates a new promotional campaign.

**Endpoint:** `POST /promotions`

**Request Body:**
```json
{
  "code": "SUMMER2024",
  "name": "Summer Sale 2024",
  "description": "Get 20% off on all beauty services this summer",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 200000,
  "usageLimit": 1000,
  "userUsageLimit": 2,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "targetType": "ALL",
  "targetIds": [],
  "createdBy": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SUMMER2024",
  "name": "Summer Sale 2024",
  "description": "Get 20% off on all beauty services this summer",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 200000,
  "usageLimit": 1000,
  "usedCount": 0,
  "userUsageLimit": 2,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "isActive": true,
  "targetType": "ALL",
  "targetIds": [],
  "createdAt": "2024-05-15T10:30:00.000Z",
  "updatedAt": "2024-05-15T10:30:00.000Z",
  "createdBy": "123e4567-e89b-12d3-a456-426614174000",
  "isValid": true,
  "remainingUsage": 1000
}
```

### 2. Get All Promotions

Retrieves a paginated list of promotions with optional filtering.

**Endpoint:** `GET /promotions`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name, code, or description
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc or desc (default: desc)
- `isActive` (optional): Filter by active status
- `targetType` (optional): Filter by target type
- `type` (optional): Filter by promotion type

**Example Request:**
```
GET /promotions?page=1&limit=10&search=summer&isActive=true&type=PERCENTAGE
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "code": "SUMMER2024",
      "name": "Summer Sale 2024",
      "description": "Get 20% off on all beauty services this summer",
      "type": "PERCENTAGE",
      "value": 20,
      "minOrderAmount": 500000,
      "maxDiscountAmount": 200000,
      "usageLimit": 1000,
      "usedCount": 150,
      "userUsageLimit": 2,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.000Z",
      "isActive": true,
      "targetType": "ALL",
      "targetIds": [],
      "createdAt": "2024-05-15T10:30:00.000Z",
      "updatedAt": "2024-05-15T10:30:00.000Z",
      "createdBy": "123e4567-e89b-12d3-a456-426614174000",
      "isValid": true,
      "remainingUsage": 850
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

### 3. Get Promotion by ID

Retrieves a specific promotion by its ID.

**Endpoint:** `GET /promotions/:id`

**Path Parameters:**
- `id`: Promotion ID (UUID)

**Example Request:**
```
GET /promotions/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SUMMER2024",
  "name": "Summer Sale 2024",
  "description": "Get 20% off on all beauty services this summer",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 200000,
  "usageLimit": 1000,
  "usedCount": 150,
  "userUsageLimit": 2,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "isActive": true,
  "targetType": "ALL",
  "targetIds": [],
  "createdAt": "2024-05-15T10:30:00.000Z",
  "updatedAt": "2024-05-15T10:30:00.000Z",
  "createdBy": "123e4567-e89b-12d3-a456-426614174000",
  "isValid": true,
  "remainingUsage": 850
}
```

### 4. Update Promotion

Updates an existing promotion.

**Endpoint:** `PATCH /promotions/:id`

**Path Parameters:**
- `id`: Promotion ID (UUID)

**Request Body:**
```json
{
  "name": "Summer Sale 2024 - Updated",
  "description": "Get 25% off on all beauty services this summer",
  "value": 25,
  "maxDiscountAmount": 300000
}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SUMMER2024",
  "name": "Summer Sale 2024 - Updated",
  "description": "Get 25% off on all beauty services this summer",
  "type": "PERCENTAGE",
  "value": 25,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 300000,
  "usageLimit": 1000,
  "usedCount": 150,
  "userUsageLimit": 2,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "isActive": true,
  "targetType": "ALL",
  "targetIds": [],
  "createdAt": "2024-05-15T10:30:00.000Z",
  "updatedAt": "2024-05-20T14:45:00.000Z",
  "createdBy": "123e4567-e89b-12d3-a456-426614174000",
  "isValid": true,
  "remainingUsage": 850
}
```

### 5. Delete Promotion

Deletes a promotion permanently.

**Endpoint:** `DELETE /promotions/:id`

**Path Parameters:**
- `id`: Promotion ID (UUID)

**Response (204 No Content):**
No response body.

### 6. Activate Promotion

Activates a promotion.

**Endpoint:** `PATCH /promotions/:id/activate`

**Path Parameters:**
- `id`: Promotion ID (UUID)

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SUMMER2024",
  "name": "Summer Sale 2024",
  "description": "Get 20% off on all beauty services this summer",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 200000,
  "usageLimit": 1000,
  "usedCount": 150,
  "userUsageLimit": 2,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "isActive": true,
  "targetType": "ALL",
  "targetIds": [],
  "createdAt": "2024-05-15T10:30:00.000Z",
  "updatedAt": "2024-05-20T14:45:00.000Z",
  "createdBy": "123e4567-e89b-12d3-a456-426614174000",
  "isValid": true,
  "remainingUsage": 850
}
```

### 7. Deactivate Promotion

Deactivates a promotion.

**Endpoint:** `PATCH /promotions/:id/deactivate`

**Path Parameters:**
- `id`: Promotion ID (UUID)

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SUMMER2024",
  "name": "Summer Sale 2024",
  "description": "Get 20% off on all beauty services this summer",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 200000,
  "usageLimit": 1000,
  "usedCount": 150,
  "userUsageLimit": 2,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "isActive": false,
  "targetType": "ALL",
  "targetIds": [],
  "createdAt": "2024-05-15T10:30:00.000Z",
  "updatedAt": "2024-05-20T14:45:00.000Z",
  "createdBy": "123e4567-e89b-12d3-a456-426614174000",
  "isValid": false,
  "remainingUsage": 850
}
```

### 8. Validate Promotion

Validates a promotion code for a user and order amount.

**Endpoint:** `POST /promotions/validate`

**Request Body:**
```json
{
  "code": "SUMMER2024",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "orderAmount": 600000
}
```

**Response (200 OK):**
```json
{
  "isValid": true,
  "promotion": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": "SUMMER2024",
    "name": "Summer Sale 2024",
    "type": "PERCENTAGE",
    "value": 20,
    "minOrderAmount": 500000,
    "maxDiscountAmount": 200000
  },
  "discountAmount": 120000,
  "finalAmount": 480000,
  "errors": []
}
```

**Response (200 OK - Invalid):**
```json
{
  "isValid": false,
  "promotion": null,
  "discountAmount": null,
  "finalAmount": null,
  "errors": [
    "Promotion has expired",
    "Minimum order amount not met"
  ]
}
```

### 9. Apply Promotion

Applies a promotion to an order and creates usage record.

**Endpoint:** `POST /promotions/apply`

**Request Body:**
```json
{
  "code": "SUMMER2024",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "orderAmount": 600000,
  "bookingId": "123e4567-e89b-12d3-a456-426614174002"
}
```

**Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174003",
  "promotionId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "discountAmount": 120000,
  "originalAmount": 600000,
  "finalAmount": 480000,
  "createdAt": "2024-06-15T14:30:00.000Z"
}
```

### 10. Get Available Promotions

Retrieves promotions available for a specific user and order amount.

**Endpoint:** `POST /promotions/available`

**Request Body:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "orderAmount": 600000
}
```

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": "SUMMER2024",
    "name": "Summer Sale 2024",
    "description": "Get 20% off on all beauty services this summer",
    "type": "PERCENTAGE",
    "value": 20,
    "minOrderAmount": 500000,
    "maxDiscountAmount": 200000,
    "usageLimit": 1000,
    "usedCount": 150,
    "userUsageLimit": 2,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T23:59:59.000Z",
    "isActive": true,
    "targetType": "ALL",
    "targetIds": [],
    "createdAt": "2024-05-15T10:30:00.000Z",
    "updatedAt": "2024-05-15T10:30:00.000Z",
    "createdBy": "123e4567-e89b-12d3-a456-426614174000",
    "isValid": true,
    "remainingUsage": 850
  }
]
```

### 11. Get Promotion Statistics

Retrieves usage statistics for a specific promotion.

**Endpoint:** `GET /promotions/:id/stats`

**Path Parameters:**
- `id`: Promotion ID (UUID)

**Response (200 OK):**
```json
{
  "promotionId": "123e4567-e89b-12d3-a456-426614174000",
  "totalUsage": 150,
  "totalDiscountGiven": 7500000,
  "totalRevenue": 45000000,
  "uniqueUsers": 120,
  "conversionRate": 15.5,
  "averageOrderValue": 300000
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Promotion code must be between 2 and 50 characters",
    "Promotion value must be positive"
  ],
  "timestamp": "2024-05-15T10:30:00.000Z",
  "path": "/promotions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Promotion with ID '123e4567-e89b-12d3-a456-426614174000' not found",
  "timestamp": "2024-05-15T10:30:00.000Z",
  "path": "/promotions/123e4567-e89b-12d3-a456-426614174000"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Promotion with code 'SUMMER2024' already exists",
  "timestamp": "2024-05-15T10:30:00.000Z",
  "path": "/promotions"
}
```

## Data Types

### Promotion Types
- `PERCENTAGE`: Percentage-based discount
- `FIXED_AMOUNT`: Fixed amount discount
- `FREE_SHIPPING`: Free shipping offer
- `BUY_X_GET_Y`: Buy X get Y free

### Promotion Targets
- `ALL`: Available for all users
- `USER`: Specific users only
- `SERVICE`: Specific services only
- `PARTNER`: Specific partners only
- `CATEGORY`: Service categories only

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Promotion application: 10 requests per minute
- Validation endpoints: 50 requests per minute

## Caching

- Promotion lists are cached for 5 minutes
- Promotion validation results are cached for 1 minute
- Statistics are cached for 15 minutes
