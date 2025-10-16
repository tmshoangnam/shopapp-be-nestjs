import { PrismaClient, BookingStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate random date within a range
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// Helper function to get random status with weighted probability
function getRandomBookingStatus(): BookingStatus {
  const statuses = [
    { status: BookingStatus.PENDING, weight: 0.15 },
    { status: BookingStatus.CONFIRMED, weight: 0.25 },
    { status: BookingStatus.IN_PROGRESS, weight: 0.10 },
    { status: BookingStatus.COMPLETED, weight: 0.40 },
    { status: BookingStatus.CANCELLED, weight: 0.08 },
    { status: BookingStatus.NO_SHOW, weight: 0.02 },
  ];

  const random = Math.random();
  let cumulative = 0;

  for (const item of statuses) {
    cumulative += item.weight;
    if (random <= cumulative) {
      return item.status;
    }
  }

  return BookingStatus.COMPLETED; // fallback
}

// Helper function to get payment status based on booking status
function getPaymentStatus(bookingStatus: BookingStatus): PaymentStatus {
  switch (bookingStatus) {
    case BookingStatus.COMPLETED:
      return Math.random() > 0.1 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
    case BookingStatus.CANCELLED:
      return Math.random() > 0.3 ? PaymentStatus.REFUNDED : PaymentStatus.PENDING;
    case BookingStatus.NO_SHOW:
      return Math.random() > 0.5 ? PaymentStatus.REFUNDED : PaymentStatus.PENDING;
    default:
      return Math.random() > 0.2 ? PaymentStatus.PENDING : PaymentStatus.PROCESSING;
  }
}

export async function seedBookings() {
  console.log('🌱 Starting booking seeding...');

  try {
    // Get required data for creating bookings
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        partner: {
          select: { id: true, name: true },
        },
      },
    });

    if (users.length === 0) {
      console.log('⚠️  No active users found. Please seed users first.');
      return;
    }

    if (services.length === 0) {
      console.log('⚠️  No active services found. Please seed services first.');
      return;
    }

    // Clear existing bookings and payments (optional - remove if you want to keep existing data)
    await prisma.payment.deleteMany({});
    await prisma.booking.deleteMany({});
    console.log('🗑️  Cleared existing bookings and payments');

    const bookings = [];
    const payments = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    // Create bookings with realistic data
    const numberOfBookings = 200; // Adjust this number as needed

    for (let i = 0; i < numberOfBookings; i++) {
      // Select random user and service
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];

      // Generate booking date (past, present, or future)
      const bookingDate = getRandomDate(startDate, endDate);
      const startTime = getRandomDate(
        new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), 8, 0), // 8 AM
        new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), 18, 0)  // 6 PM
      );
      const endTime = addMinutes(startTime, randomService.duration);

      // Generate amounts
      const totalAmount = Number(randomService.price);
      const discountAmount = Math.random() > 0.7 ? Math.floor(totalAmount * 0.1) : 0; // 10% discount for 30% of bookings
      const finalAmount = totalAmount - discountAmount;

      // Generate status
      const status = getRandomBookingStatus();
      const paymentStatus = getPaymentStatus(status);

      // Generate payment method
      const paymentMethods = ['cash', 'card', 'bank_transfer', 'wallet'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: randomUser.id,
          serviceId: randomService.id,
          partnerId: randomService.partnerId,
          bookingDate: bookingDate,
          startTime: startTime,
          endTime: endTime,
          status: status,
          totalAmount: totalAmount,
          discountAmount: discountAmount,
          finalAmount: finalAmount,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,
          notes: Math.random() > 0.8 ? `Special request: ${['Please call before arrival', 'Allergic to certain products', 'Prefer morning appointment', 'Need wheelchair access'][Math.floor(Math.random() * 4)]}` : null,
          cancellationReason: status === BookingStatus.CANCELLED ? 
            ['Customer requested cancellation', 'Staff unavailable', 'Weather conditions', 'Emergency situation'][Math.floor(Math.random() * 4)] : null,
          cancelledAt: status === BookingStatus.CANCELLED ? 
            new Date(startTime.getTime() - Math.random() * 24 * 60 * 60 * 1000) : null, // Cancelled within 24 hours before appointment
        },
      });

      bookings.push(booking);

      // Create payment if booking is completed or has payment
      if (paymentStatus === PaymentStatus.COMPLETED || paymentStatus === PaymentStatus.PROCESSING) {
        const payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: finalAmount,
            currency: 'VND',
            method: paymentMethod,
            status: paymentStatus,
            transactionId: paymentStatus === PaymentStatus.COMPLETED ? 
              `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
            gateway: paymentMethod === 'card' ? 
              ['stripe', 'paypal', 'vnpay'][Math.floor(Math.random() * 3)] : null,
            gatewayResponse: paymentStatus === PaymentStatus.COMPLETED ? 
              { success: true, transactionId: `txn_${Date.now()}`, timestamp: new Date().toISOString() } : null,
          },
        });

        payments.push(payment);
      }
    }

    console.log(`✅ Created ${bookings.length} bookings and ${payments.length} payments successfully!`);

    // Display summary by status
    const statusStats = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        finalAmount: true,
      },
    });

    console.log('\n📊 Booking Summary by Status:');
    // statusStats.forEach((stat) => {
    //   console.log(`   ${stat.status}:`);
    //   console.log(`     Count: ${stat._count.id}`);
    //   console.log(`     Total Revenue: ${Math.round(stat._sum.finalAmount || 0).toLocaleString()} VND`);
    // });

    // Display summary by payment status
    const paymentStats = await prisma.booking.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true,
      },
      _sum: {
        finalAmount: true,
      },
    });

    console.log('\n💳 Payment Summary by Status:');
    // paymentStats.forEach((stat) => {
    //   console.log(`   ${stat.paymentStatus}:`);
    //   console.log(`     Count: ${stat._count.id}`);
    //   console.log(`     Total Amount: ${Math.round(stat._sum.finalAmount || 0).toLocaleString()} VND`);
    // });

    // Display summary by partner
    const partnerStats = await prisma.booking.groupBy({
      by: ['partnerId'],
      _count: {
        id: true,
      },
      _sum: {
        finalAmount: true,
      },
    });

    console.log('\n🏢 Bookings per Partner:');
    for (const stat of partnerStats) {
      const partner = await prisma.partner.findUnique({
        where: { id: stat.partnerId },
        select: { name: true },
      });
    //   console.log(`   ${partner?.name}: ${stat._count.id} bookings, ${Math.round(stat._sum.finalAmount || 0).toLocaleString()} VND revenue`);
    }

    // Display summary by month
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "bookingDate") as month,
        COUNT(*) as booking_count,
        SUM("finalAmount") as total_revenue
      FROM bookings 
      GROUP BY DATE_TRUNC('month', "bookingDate")
      ORDER BY month
    `;

    console.log('\n📅 Monthly Booking Summary:');
    (monthlyStats as any[]).forEach((stat) => {
      const month = new Date(stat.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      console.log(`   ${month}: ${stat.booking_count} bookings, ${Math.round(Number(stat.total_revenue)).toLocaleString()} VND revenue`);
    });

    // Show sample bookings
    const sampleBookings = await prisma.booking.findMany({
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            name: true,
            category: true,
          },
        },
        partner: {
          select: {
            name: true,
          },
        },
        payments: {
          select: {
            amount: true,
            status: true,
            method: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n🎯 Sample Bookings:');
    sampleBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.user.firstName} ${booking.user.lastName}`);
      console.log(`      Service: ${booking.service.name} (${booking.service.category})`);
      console.log(`      Partner: ${booking.partner?.name}`);
      console.log(`      Date: ${booking.bookingDate.toLocaleDateString()}`);
      console.log(`      Time: ${booking.startTime.toLocaleTimeString()} - ${booking.endTime.toLocaleTimeString()}`);
      console.log(`      Status: ${booking.status}`);
      console.log(`      Amount: ${booking.finalAmount.toLocaleString()} VND`);
      if (booking.payments.length > 0) {
        console.log(`      Payment: ${booking.payments[0].status} (${booking.payments[0].method})`);
      }
    });

    // Show recent bookings for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log(`\n📅 Today's Bookings: ${todayBookings}`);

  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedBookings()
    .then(() => {
      console.log('🎉 Booking seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Booking seeding failed:', error);
      process.exit(1);
    });
}



