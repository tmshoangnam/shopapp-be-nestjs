# Database Seeding

This directory contains comprehensive seed data for all database tables in the ShopApp backend.

## 📁 Seed Files

| File | Description | Dependencies |
|------|-------------|--------------|
| `user.seed.ts` | Creates users with different roles and OAuth accounts | None |
| `partner.seed.ts` | Creates beauty service partners | Users (optional) |
| `service.seed.ts` | Creates services for each partner | Partners |
| `booking.seed.ts` | Creates realistic booking data | Users, Services |
| `review.seed.ts` | Creates reviews for completed bookings | Bookings |
| `notification.seed.ts` | Creates notifications for users and bookings | Users, Bookings |
| `index.ts` | Main seeding orchestrator | All above |

## 🚀 Quick Start

### Seed All Data
```bash
# Seed all tables with realistic data
npm run db:seed:all

# Or run the main seed file directly
npm run db:seed
```

### Seed Individual Tables
```bash
# Seed specific tables
npm run db:seed:users
npm run db:seed:partners
npm run db:seed:services
npm run db:seed:bookings
npm run db:seed:reviews
npm run db:seed:notifications
```

### Reset and Reseed
```bash
# Reset database and seed all data
npm run db:reset
```

## 📊 Seed Data Overview

### Users (25+ records)
- **Admin Users**: Super Admin, Admin, Staff accounts
- **Regular Users**: 20+ customer accounts
- **OAuth Users**: Google, Facebook, GitHub accounts
- **Test Credentials**: Ready-to-use login credentials

### Partners (15+ records)
- **Beauty Salons**: Various types and sizes
- **Service Categories**: Hair, Nails, Facial, Massage, etc.
- **Status Types**: Active, Inactive, Suspended
- **Commission Rates**: Realistic commission structures

### Services (30+ records)
- **Service Categories**: 
  - Hair Services (5 services)
  - Nail Services (5 services)
  - Facial Services (5 services)
  - Massage Services (5 services)
  - Eyebrow & Eyelash (5 services)
  - Body Treatments (4 services)
  - Barber Services (4 services)
- **Realistic Pricing**: VND currency with proper ranges
- **Duration**: Realistic service durations
- **Partner Assignment**: Services distributed across partners

### Bookings (200+ records)
- **Realistic Data**: Past, present, and future bookings
- **Status Distribution**: 
  - 40% Completed
  - 25% Confirmed
  - 15% Pending
  - 10% In Progress
  - 8% Cancelled
  - 2% No Show
- **Payment Integration**: Payment records for completed bookings
- **Time Conflicts**: Proper time slot management
- **User Distribution**: Bookings spread across users

### Reviews (140+ records)
- **Rating Distribution**: 
  - 45% 5-star reviews
  - 30% 4-star reviews
  - 15% 3-star reviews
  - 7% 2-star reviews
  - 3% 1-star reviews
- **Realistic Comments**: Context-appropriate review text
- **Review Rate**: 70% of completed bookings have reviews

### Notifications (500+ records)
- **Appointment Notifications**: Confirmations, reminders, cancellations
- **System Updates**: Platform announcements
- **Messages**: Support team communications
- **Read Status**: Realistic read/unread distribution

## 🔐 Test Credentials

After seeding, you can use these credentials to test the application:

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

## 🎯 Sample Data Examples

### Sample Booking
```json
{
  "id": "booking-uuid",
  "user": "John Doe",
  "service": "Hair Cut & Style",
  "partner": "Beauty Salon Elegance",
  "bookingDate": "2024-01-15",
  "startTime": "10:00 AM",
  "endTime": "11:00 AM",
  "status": "CONFIRMED",
  "totalAmount": 150000,
  "finalAmount": 135000,
  "paymentStatus": "COMPLETED"
}
```

### Sample Review
```json
{
  "id": "review-uuid",
  "user": "Jane Smith",
  "service": "Manicure",
  "rating": 5,
  "comment": "Excellent service! Highly recommend to everyone.",
  "createdAt": "2024-01-16"
}
```

## 🔧 Customization

### Adjusting Data Volume
Edit the seed files to change the amount of data:

```typescript
// In booking.seed.ts
const numberOfBookings = 200; // Change this number

// In notification.seed.ts
const systemUpdateCount = 5; // Change this number
```

### Adding New Data
To add new seed data:

1. Create a new seed file: `new-table.seed.ts`
2. Add the import to `index.ts`
3. Add the seeding call in the correct order
4. Add a new npm script in `package.json`

### Modifying Relationships
The seed files respect foreign key relationships:

1. **Users** → No dependencies
2. **Partners** → Can reference users (optional)
3. **Services** → Must reference partners
4. **Bookings** → Must reference users and services
5. **Reviews** → Must reference completed bookings
6. **Notifications** → Must reference users and bookings

## 📈 Performance Considerations

### Large Datasets
For production-like testing with large datasets:

```typescript
// Increase these numbers for more data
const numberOfBookings = 10000;
const numberOfUsers = 1000;
const numberOfServices = 500;
```

### Memory Usage
The seeding process uses:
- **Batch Operations**: Efficient database operations
- **Memory Management**: Proper cleanup and disconnection
- **Transaction Safety**: Rollback on errors

## 🐛 Troubleshooting

### Common Issues

1. **Foreign Key Errors**
   ```
   Error: Foreign key constraint failed
   ```
   **Solution**: Ensure dependencies are seeded in correct order

2. **Duplicate Key Errors**
   ```
   Error: Unique constraint failed
   ```
   **Solution**: Clear existing data before seeding

3. **Memory Issues**
   ```
   Error: JavaScript heap out of memory
   ```
   **Solution**: Reduce batch sizes or increase Node.js memory

### Debug Mode
Run individual seed files to debug:

```bash
# Debug specific table
npm run db:seed:users
npm run db:seed:bookings
```

## 📝 Data Quality

### Realistic Data
- **Names**: Realistic first/last names
- **Emails**: Proper email formats
- **Phone Numbers**: Valid phone number formats
- **Addresses**: Realistic addresses
- **Prices**: Market-appropriate pricing
- **Dates**: Logical date relationships

### Data Consistency
- **Foreign Keys**: All relationships maintained
- **Status Transitions**: Logical booking status flows
- **Payment Logic**: Payment status matches booking status
- **Review Logic**: Reviews only for completed bookings

## 🎉 Success Indicators

After successful seeding, you should see:

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

## 🔄 Maintenance

### Regular Updates
- Update seed data quarterly
- Add new service categories as needed
- Adjust pricing based on market changes
- Update test credentials periodically

### Data Cleanup
```bash
# Clear all data and reseed
npm run db:reset

# Clear specific tables
npx prisma studio
# Then manually delete records
```

This seeding system provides a comprehensive foundation for testing and development with realistic, interconnected data that respects all business rules and relationships.



