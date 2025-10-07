import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate realistic review comments
function generateReviewComment(rating: number): string {
  const comments = {
    5: [
      'Excellent service! Highly recommend to everyone.',
      'Outstanding experience, will definitely come back.',
      'Perfect service, exceeded my expectations.',
      'Amazing staff and great atmosphere.',
      'Best service I\'ve ever had, worth every penny.',
      'Professional, friendly, and top-quality service.',
      'Absolutely fantastic! Couldn\'t be happier.',
      'Wonderful experience from start to finish.',
      'Exceptional service and attention to detail.',
      'Love this place! Will be a regular customer.',
    ],
    4: [
      'Very good service, would recommend.',
      'Great experience overall, minor room for improvement.',
      'Good quality service, friendly staff.',
      'Satisfied with the service, will return.',
      'Nice atmosphere and professional service.',
      'Good value for money, enjoyed the experience.',
      'Pleasant experience, staff was helpful.',
      'Quality service, would come back again.',
      'Good service with minor improvements needed.',
      'Overall satisfied, met my expectations.',
    ],
    3: [
      'Average service, nothing special.',
      'Okay experience, room for improvement.',
      'Service was fine, but could be better.',
      'Decent service, some areas need work.',
      'Average quality, staff was friendly.',
      'Service was acceptable, not outstanding.',
      'It was okay, but expected more.',
      'Average experience, nothing to complain about.',
      'Service was decent, but not exceptional.',
      'Fair service, could use some improvements.',
    ],
    2: [
      'Below average service, disappointed.',
      'Not satisfied with the experience.',
      'Service needs significant improvement.',
      'Poor quality, would not recommend.',
      'Disappointing experience, expected better.',
      'Service was lacking, not worth the price.',
      'Below expectations, needs improvement.',
      'Not happy with the service quality.',
      'Disappointed with the overall experience.',
      'Service was poor, would not return.',
    ],
    1: [
      'Terrible service, waste of money.',
      'Worst experience ever, avoid this place.',
      'Completely disappointed, never coming back.',
      'Awful service, staff was unprofessional.',
      'Horrible experience, would not recommend.',
      'Terrible quality, completely unsatisfied.',
      'Worst service I\'ve ever received.',
      'Completely unacceptable, very disappointed.',
      'Terrible experience, waste of time and money.',
      'Awful service, would never return.',
    ],
  };

  const ratingComments = comments[rating as keyof typeof comments] || comments[3];
  return ratingComments[Math.floor(Math.random() * ratingComments.length)];
}

export async function seedReviews() {
  console.log('🌱 Starting review seeding...');

  try {
    // Get completed bookings to create reviews for
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (completedBookings.length === 0) {
      console.log('⚠️  No completed bookings found. Please seed bookings first.');
      return;
    }

    // Clear existing reviews (optional - remove if you want to keep existing data)
    await prisma.review.deleteMany({});
    console.log('🗑️  Cleared existing reviews');

    const reviews = [];
    
    // Create reviews for 70% of completed bookings (realistic review rate)
    const numberOfReviews = Math.floor(completedBookings.length * 0.7);
    const selectedBookings = completedBookings
      .sort(() => Math.random() - 0.5) // Shuffle array
      .slice(0, numberOfReviews);

    for (const booking of selectedBookings) {
      // Generate rating with weighted distribution (more 4-5 star reviews)
      const ratingWeights = [
        { rating: 5, weight: 0.45 }, // 45% 5-star
        { rating: 4, weight: 0.30 }, // 30% 4-star
        { rating: 3, weight: 0.15 }, // 15% 3-star
        { rating: 2, weight: 0.07 }, // 7% 2-star
        { rating: 1, weight: 0.03 }, // 3% 1-star
      ];

      const random = Math.random();
      let cumulative = 0;
      let rating = 5; // fallback

      for (const item of ratingWeights) {
        cumulative += item.weight;
        if (random <= cumulative) {
          rating = item.rating;
          break;
        }
      }

      // Generate comment (80% chance of having a comment)
      const hasComment = Math.random() > 0.2;
      const comment = hasComment ? generateReviewComment(rating) : null;

      // Create review
      const review = await prisma.review.create({
        data: {
          userId: booking.userId,
          serviceId: booking.serviceId,
          bookingId: booking.id,
          rating: rating,
          comment: comment,
        },
      });

      reviews.push(review);
    }

    console.log(`✅ Created ${reviews.length} reviews successfully!`);

    // Display summary by rating
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      _count: {
        id: true,
      },
    });

    console.log('\n⭐ Review Summary by Rating:');
    ratingStats
      .sort((a, b) => b.rating - a.rating)
      .forEach((stat) => {
        const stars = '⭐'.repeat(stat.rating);
        const percentage = ((stat._count.id / reviews.length) * 100).toFixed(1);
        console.log(`   ${stars} (${stat.rating} stars): ${stat._count.id} reviews (${percentage}%)`);
      });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    console.log(`\n📊 Average Rating: ${avgRating._avg.rating?.toFixed(2)} ⭐`);

    // Display summary by service category
    const categoryStats = await prisma.review.groupBy({
      by: ['serviceId'],
      _count: {
        id: true,
      },
      _avg: {
        rating: true,
      },
    });

    console.log('\n🏷️  Top Rated Services:');
    const serviceStats = await Promise.all(
      categoryStats.map(async (stat) => {
        const service = await prisma.service.findUnique({
          where: { id: stat.serviceId },
          select: { name: true, category: true },
        });
        return {
          name: service?.name,
          category: service?.category,
          count: stat._count.id,
          avgRating: stat._avg.rating,
        };
      })
    );

    serviceStats
      .filter(stat => stat.name)
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      .slice(0, 10)
      .forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.name} (${stat.category})`);
        console.log(`      Rating: ${stat.avgRating?.toFixed(2)} ⭐ (${stat.count} reviews)`);
      });

    // Display summary by partner
    const partnerStats = await prisma.review.groupBy({
      by: ['serviceId'],
      _count: {
        id: true,
      },
      _avg: {
        rating: true,
      },
    });

    console.log('\n🏢 Partner Review Summary:');
    const partnerReviewStats = new Map();

    for (const stat of partnerStats) {
      const service = await prisma.service.findUnique({
        where: { id: stat.serviceId },
        include: {
          partner: {
            select: { id: true, name: true },
          },
        },
      });

      if (service?.partner) {
        const partnerId = service.partner.id;
        const partnerName = service.partner.name;

        if (!partnerReviewStats.has(partnerId)) {
          partnerReviewStats.set(partnerId, {
            name: partnerName,
            totalReviews: 0,
            totalRating: 0,
            serviceCount: 0,
          });
        }

        const partnerStat = partnerReviewStats.get(partnerId);
        partnerStat.totalReviews += stat._count.id;
        partnerStat.totalRating += (stat._avg.rating || 0) * stat._count.id;
        partnerStat.serviceCount += 1;
      }
    }

    Array.from(partnerReviewStats.values())
      .map(stat => ({
        ...stat,
        avgRating: stat.totalRating / stat.totalReviews,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.name}`);
        console.log(`      Rating: ${stat.avgRating.toFixed(2)} ⭐ (${stat.totalReviews} reviews, ${stat.serviceCount} services)`);
      });

    // Show sample reviews
    const sampleReviews = await prisma.review.findMany({
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
            category: true,
          },
        },
        booking: {
          select: {
            partner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n🎯 Sample Reviews:');
    sampleReviews.forEach((review, index) => {
      const stars = '⭐'.repeat(review.rating);
      console.log(`   ${index + 1}. ${stars} (${review.rating}/5)`);
      console.log(`      User: ${review.user.firstName} ${review.user.lastName}`);
      console.log(`      Service: ${review.service.name} (${review.service.category})`);
      console.log(`      Partner: ${review.booking.partner?.name}`);
      if (review.comment) {
        console.log(`      Comment: "${review.comment}"`);
      }
    });

    // Show recent reviews (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReviews = await prisma.review.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    console.log(`\n📅 Recent Reviews (Last 7 days): ${recentReviews}`);

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedReviews()
    .then(() => {
      console.log('🎉 Review seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Review seeding failed:', error);
      process.exit(1);
    });
}
