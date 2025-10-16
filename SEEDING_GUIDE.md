# 🌱 Database Seeding Guide

## Tổng quan

Hệ thống seeding đã được tạo hoàn chỉnh với dữ liệu thực tế cho tất cả các bảng trong database. Dữ liệu được tạo có tính liên kết cao và tuân thủ các ràng buộc khóa ngoại.

## 🚀 Cách sử dụng

### 1. Seed toàn bộ database
```bash
# Chạy seeding cho tất cả bảng
npm run db:seed:all

# Hoặc chạy file chính
npm run db:seed
```

### 2. Seed từng bảng riêng lẻ
```bash
# Seed users trước
npm run db:seed:users

# Seed partners
npm run db:seed:partners

# Seed services
npm run db:seed:services

# Seed bookings
npm run db:seed:bookings

# Seed reviews
npm run db:seed:reviews

# Seed notifications
npm run db:seed:notifications
```

### 3. Reset và seed lại
```bash
# Xóa toàn bộ database và seed lại
npm run db:reset
```

## 📊 Dữ liệu được tạo

### 👥 Users (25+ records)
- **Admin accounts**: Super Admin, Admin, Staff
- **User accounts**: 20+ khách hàng
- **OAuth accounts**: Google, Facebook, GitHub
- **Test credentials**: Sẵn sàng để test

### 🏢 Partners (15+ records)
- **Beauty Salons**: Các loại salon khác nhau
- **Service Categories**: Hair, Nails, Facial, Massage, etc.
- **Status Types**: Active, Inactive, Suspended
- **Commission Rates**: Cấu trúc hoa hồng thực tế

### 🛍️ Services (30+ records)
- **Hair Services**: 5 dịch vụ
- **Nail Services**: 5 dịch vụ  
- **Facial Services**: 5 dịch vụ
- **Massage Services**: 5 dịch vụ
- **Eyebrow & Eyelash**: 5 dịch vụ
- **Body Treatments**: 4 dịch vụ
- **Barber Services**: 4 dịch vụ

### 📅 Bookings (200+ records)
- **Realistic Data**: Booking quá khứ, hiện tại, tương lai
- **Status Distribution**: 
  - 40% Completed
  - 25% Confirmed  
  - 15% Pending
  - 10% In Progress
  - 8% Cancelled
  - 2% No Show
- **Payment Integration**: Payment records cho booking hoàn thành
- **Time Conflicts**: Quản lý time slot đúng cách

### ⭐ Reviews (140+ records)
- **Rating Distribution**: 
  - 45% 5-star reviews
  - 30% 4-star reviews
  - 15% 3-star reviews
  - 7% 2-star reviews
  - 3% 1-star reviews
- **Realistic Comments**: Nội dung review phù hợp
- **Review Rate**: 70% booking hoàn thành có review

### 🔔 Notifications (500+ records)
- **Appointment Notifications**: Confirmations, reminders, cancellations
- **System Updates**: Thông báo platform
- **Messages**: Tin nhắn từ support team
- **Read Status**: Phân bố read/unread thực tế

## 🔐 Test Credentials

### Admin Accounts
```
Super Admin: admin@shopapp.com / Admin123!
Admin:       admin2@shopapp.com / Admin123!
Staff:       staff@shopapp.com / Staff123!
```

### User Accounts
```
User: john.doe@example.com / User123!
User: jane.smith@example.com / User123!
User: mike.johnson@example.com / User123!
```

### OAuth Accounts
```
Google:  google.user@gmail.com (OAuth)
Facebook: facebook.user@facebook.com (OAuth)
GitHub:  github.user@github.com (OAuth)
```

## 🎯 Thứ tự Seeding

Dữ liệu được seed theo thứ tự đúng để đảm bảo khóa ngoại:

1. **Users** → Không có dependency
2. **Partners** → Có thể reference users (optional)
3. **Services** → Phải reference partners
4. **Bookings** → Phải reference users và services
5. **Reviews** → Phải reference completed bookings
6. **Notifications** → Phải reference users và bookings

## 🔧 Tùy chỉnh

### Thay đổi số lượng dữ liệu
```typescript
// Trong booking.seed.ts
const numberOfBookings = 200; // Thay đổi số này

// Trong notification.seed.ts  
const systemUpdateCount = 5; // Thay đổi số này
```

### Thêm dữ liệu mới
1. Tạo file seed mới: `new-table.seed.ts`
2. Thêm import vào `index.ts`
3. Thêm seeding call theo thứ tự đúng
4. Thêm npm script mới vào `package.json`

## 📈 Kết quả mong đợi

Sau khi seeding thành công, bạn sẽ thấy:

```
✅ Created 25 users successfully!
✅ Created 15 partners successfully!
✅ Created 30 services successfully!
✅ Created 200 bookings and 150 payments successfully!
✅ Created 140 reviews successfully!
✅ Created 500 notifications successfully!

📊 Final Database Summary:
   👥 Users: 25
   🏢 Partners: 15
   🛍️  Services: 30
   📅 Bookings: 200
   ⭐ Reviews: 140
   🔔 Notifications: 500
   💳 Payments: 150
   💰 Total Revenue: 45,000,000 VND
   ⭐ Average Rating: 4.2

🎉 Database is ready for use!
```

## 🎉 Bước tiếp theo

1. **Start application**: `npm run start:dev`
2. **Visit Swagger**: `http://localhost:3000/api`
3. **Test Booking APIs** với dữ liệu đã seed
4. **Login với test credentials** để test authentication
5. **Explore data** trong Prisma Studio: `npm run prisma:studio`

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Foreign Key Errors**
   ```
   Error: Foreign key constraint failed
   ```
   **Giải pháp**: Đảm bảo seed theo đúng thứ tự dependency

2. **Duplicate Key Errors**
   ```
   Error: Unique constraint failed
   ```
   **Giải pháp**: Xóa dữ liệu cũ trước khi seed

3. **Memory Issues**
   ```
   Error: JavaScript heap out of memory
   ```
   **Giải pháp**: Giảm batch size hoặc tăng Node.js memory

### Debug Mode
```bash
# Debug từng bảng riêng lẻ
npm run db:seed:users
npm run db:seed:bookings
```

## 📝 Lưu ý quan trọng

- **Dữ liệu thực tế**: Tất cả dữ liệu đều realistic và có ý nghĩa
- **Khóa ngoại**: Tất cả relationships được duy trì đúng
- **Business Logic**: Status transitions và payment logic đúng
- **Performance**: Sử dụng batch operations hiệu quả
- **Memory Management**: Proper cleanup và disconnection

Hệ thống seeding này cung cấp foundation hoàn chỉnh cho testing và development với dữ liệu thực tế, có liên kết cao và tuân thủ tất cả business rules!



