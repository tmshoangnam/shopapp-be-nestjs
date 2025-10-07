import { PrismaClient } from '@prisma/client';
import { seedUsers } from './user.seed';
import { seedPartners } from './partner.seed';
import { seedServices } from './service.seed';
import { seedBookings } from './booking.seed';
import { seedReviews } from './review.seed';
import { seedNotifications } from './notification.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Step 1: Seed users first (other entities might reference users)
    console.log('📝 Step 1: Seeding users...');
    await seedUsers();
    
    // Step 2: Seed partners (services will reference partners)
    console.log('\n📝 Step 2: Seeding partners...');
    await seedPartners();
    
    // Step 3: Seed services (bookings will reference services)
    console.log('\n📝 Step 3: Seeding services...');
    await seedServices();
    
    // Step 4: Seed bookings (reviews and notifications will reference bookings)
    console.log('\n📝 Step 4: Seeding bookings...');
    await seedBookings();
    
    // Step 5: Seed reviews (references bookings)
    console.log('\n📝 Step 5: Seeding reviews...');
    await seedReviews();
    
    // Step 6: Seed notifications (references users and bookings)
    console.log('\n📝 Step 6: Seeding notifications...');
    await seedNotifications();
    
    console.log('\n✨ All seeding completed successfully!');
    
    // Display final summary
    await displayFinalSummary();
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function displayFinalSummary() {
  console.log('\n📊 Final Database Summary:');
  
  try {
    const [
      userCount,
      partnerCount,
      serviceCount,
      bookingCount,
      reviewCount,
      notificationCount,
      paymentCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.partner.count(),
      prisma.service.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.notification.count(),
      prisma.payment.count(),
    ]);

    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🏢 Partners: ${partnerCount}`);
    console.log(`   🛍️  Services: ${serviceCount}`);
    console.log(`   📅 Bookings: ${bookingCount}`);
    console.log(`   ⭐ Reviews: ${reviewCount}`);
    console.log(`   🔔 Notifications: ${notificationCount}`);
    console.log(`   💳 Payments: ${paymentCount}`);

    // Calculate total revenue
    const revenueResult = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        finalAmount: true,
      },
    });

    const totalRevenue = revenueResult._sum.finalAmount || 0;
    console.log(`   💰 Total Revenue: ${totalRevenue.toLocaleString()} VND`);

    // Calculate average rating
    const avgRatingResult = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    const avgRating = avgRatingResult._avg.rating || 0;
    console.log(`   ⭐ Average Rating: ${avgRating.toFixed(2)}`);

    console.log('\n🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Error displaying final summary:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Database seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedDatabase };
