# Database Seeding Guide

## Overview
This guide explains how to use the database seeding system to populate your database with sample data for development and testing.

## Available Seed Data

### Partners
- **15 sample partners** with realistic business information
- Various business types: salons, spas, clinics, barbershops
- Different statuses: Active, Inactive, Suspended
- Commission rates ranging from 5% to 35%
- Complete contact information and descriptions

## How to Use

### 1. Seed All Data
```bash
# Using npm script (recommended)
npm run db:seed

# Using Prisma directly
npx prisma db seed
```

### 2. Seed Only Partners
```bash
npm run db:seed:partners
```

### 3. Reset Database and Seed
```bash
# This will reset the database and run all seeds
npm run db:reset
```

### 4. Manual Seeding
```bash
# Run specific seed file
npx ts-node prisma/seeds/partner.seed.ts

# Run all seeds
npx ts-node prisma/seeds/index.ts
```

## Sample Partner Data

The seeding creates 15 diverse partners:

### Active Partners (12)
- **Beauty Salon Elegance** - Premium salon (15.5% commission)
- **Urban Nail Studio** - Modern nail art (12% commission)
- **Hair Masters Academy** - Professional hair salon (18% commission)
- **Zen Wellness Spa** - Holistic wellness (20% commission)
- **Glow Skin Clinic** - Advanced dermatology (25% commission)
- **Classic Barber Shop** - Traditional barbershop (10% commission)
- **Luxe Eyebrow Studio** - Specialized brows/lashes (22% commission)
- **Tropical Tan Studio** - Professional tanning (14% commission)
- **Permanent Makeup Studio** - Cosmetic tattooing (30% commission)
- **Family Hair Care** - Family-friendly salon (8.5% commission)
- **Mobile Beauty Services** - On-demand services (16% commission)
- **Luxury Spa Resort** - Premium resort spa (35% commission)
- **Eco-Friendly Spa** - Sustainable wellness (18.5% commission)

### Inactive Partners (1)
- **Budget Beauty Center** - Affordable services (5% commission)

### Suspended Partners (1)
- **Quick Cuts Express** - Fast-service salon (7% commission)

## Data Structure

Each partner includes:
```typescript
{
  name: string;           // Business name
  description: string;    // Business description
  email: string;          // Contact email
  phone: string;          // Phone number
  address: string;        // Physical address
  website: string;        // Website URL
  logo: string;           // Logo image URL
  status: PartnerStatus;  // ACTIVE | INACTIVE | SUSPENDED
  commissionRate: number; // Commission percentage
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

## Customization

### Adding New Partners
Edit `prisma/seeds/partner.seed.ts` and add new entries to the `partnerData` array:

```typescript
const partnerData = [
  // ... existing partners
  {
    name: 'Your New Partner',
    description: 'Description of your partner',
    email: 'contact@yourpartner.com',
    phone: '+1-555-9999',
    address: 'Your Address',
    website: 'https://www.yourpartner.com',
    logo: 'https://example.com/logo.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 15.0,
  },
];
```

### Creating New Seed Files
1. Create a new file in `prisma/seeds/` (e.g., `user.seed.ts`)
2. Follow the pattern from `partner.seed.ts`
3. Add the import and function call to `prisma/seeds/index.ts`

```typescript
// In prisma/seeds/index.ts
import { seedUsers } from './user.seed';

async function main() {
  await seedPartners();
  await seedUsers(); // Add this line
  // ... other seeds
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Ensure your .env file has correct DATABASE_URL
   # Then run:
   npx prisma generate
   ```

2. **Permission Errors**
   ```bash
   # Make sure you have write permissions to the database
   # Check your database user permissions
   ```

3. **Duplicate Key Errors**
   ```bash
   # Clear existing data first:
   npx prisma migrate reset --force
   npm run db:seed
   ```

### Verification

After seeding, verify the data:

```bash
# Open Prisma Studio to view data
npx prisma studio

# Or check via API
curl http://localhost:3000/partners
```

## Best Practices

1. **Development Environment**: Always seed in development, never in production
2. **Data Consistency**: Use realistic, consistent data for testing
3. **Clean Slate**: Reset database before seeding for consistent results
4. **Version Control**: Keep seed files in version control
5. **Documentation**: Document any custom seed data for team members

## Integration with CI/CD

For automated testing, you can integrate seeding:

```yaml
# Example GitHub Actions step
- name: Seed Database
  run: |
    npm run db:reset
    npm run test
```

## API Testing

After seeding, test your API endpoints:

```bash
# Get all partners
curl -X GET "http://localhost:3000/partners?page=1&limit=10"

# Search partners
curl -X GET "http://localhost:3000/partners?search=salon"

# Filter by status
curl -X GET "http://localhost:3000/partners?status=ACTIVE"

# Get partner details
curl -X GET "http://localhost:3000/partners/{partner-id}"
```

## Next Steps

1. **Test the API** with the seeded data
2. **Create additional seed data** for other models (users, services, appointments)
3. **Set up automated testing** with seeded data
4. **Document your seed data** for team members
