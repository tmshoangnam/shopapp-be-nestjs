# RoleGuard Implementation Guide

## Overview
RoleGuard system được triển khai dựa trên Role enum từ Prisma schema để kiểm soát quyền truy cập API endpoints.

## Role Hierarchy
```typescript
enum Role {
  USER        // Cấp thấp nhất - chỉ truy cập profile cá nhân
  STAFF       // Nhân viên - quản lý appointments, services
  ADMIN       // Quản trị - quản lý users, toàn bộ hệ thống
  SUPER_ADMIN // Siêu quản trị - full control
}
```

## Components

### 1. Roles Decorator (`src/auth/decorators/roles.decorator.ts`)
```typescript
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
```

### 2. RolesGuard (`src/auth/guards/roles.guard.ts`)
- Kiểm tra exact role match
- Sử dụng khi cần quyền cụ thể

### 3. RoleHierarchyGuard (`src/auth/guards/role-hierarchy.guard.ts`)
- Kiểm tra role hierarchy (higher role có thể access lower role endpoints)
- Sử dụng khi muốn role cao hơn có thể truy cập

## Usage Examples

### Basic Usage
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getAllUsers() {
    // Only ADMIN and SUPER_ADMIN can access
  }
  
  @Get('system-settings')
  @Roles(Role.SUPER_ADMIN)
  async getSystemSettings() {
    // Only SUPER_ADMIN can access
  }
}
```

### Hierarchy Usage
```typescript
@Controller('staff')
@UseGuards(JwtAuthGuard, RoleHierarchyGuard)
export class StaffController {
  
  @Get('appointments')
  @Roles(Role.STAFF) // ADMIN and SUPER_ADMIN can also access
  async getAppointments() {
    // STAFF, ADMIN, SUPER_ADMIN can access
  }
}
```

### Public Endpoints
```typescript
@Get('public-info')
// No @Roles decorator = accessible by all authenticated users
async getPublicInfo() {
  // Any authenticated user can access
}
```

## Database Integration

### User Model
```prisma
model User {
  id     String @id @default(uuid())
  email  String @unique
  role   Role   @default(USER)
  // ... other fields
}
```

### JWT Payload
```typescript
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role, // Role được include trong JWT
};
```

## Error Responses

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN, SUPER_ADMIN. Your role: USER",
  "error": "Forbidden"
}
```

## Best Practices

1. **Always use JwtAuthGuard first** - Authentication before Authorization
2. **Use specific roles** - Be explicit about required permissions
3. **Document permissions** - Use Swagger decorators
4. **Test role scenarios** - Verify all role combinations
5. **Use hierarchy when appropriate** - Don't over-restrict access

## Testing

```typescript
// Test different roles
const adminToken = await generateToken({ role: Role.ADMIN });
const userToken = await generateToken({ role: Role.USER });

// Should succeed
await request(app).get('/admin/users').set('Authorization', `Bearer ${adminToken}`);

// Should fail with 403
await request(app).get('/admin/users').set('Authorization', `Bearer ${userToken}`);
```

