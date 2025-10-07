import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate notification messages
function generateNotificationMessage(type: NotificationType, data?: any): string {
  const messages = {
    [NotificationType.APPOINTMENT_CONFIRMED]: [
      'Your appointment has been confirmed! We look forward to seeing you.',
      'Great news! Your booking is confirmed. See you soon!',
      'Appointment confirmed! Please arrive 10 minutes early.',
      'Your appointment is confirmed. We\'re excited to serve you!',
      'Booking confirmed! Don\'t forget to bring your ID.',
    ],
    [NotificationType.APPOINTMENT_CANCELLED]: [
      'Your appointment has been cancelled. We\'re sorry for any inconvenience.',
      'Appointment cancelled. Please contact us to reschedule.',
      'Your booking was cancelled. We hope to see you soon!',
      'Appointment cancelled. Feel free to book a new time.',
      'Booking cancelled. Thank you for your understanding.',
    ],
    [NotificationType.APPOINTMENT_REMINDER]: [
      'Reminder: You have an appointment tomorrow. See you soon!',
      'Don\'t forget! Your appointment is scheduled for tomorrow.',
      'Appointment reminder: Your booking is tomorrow.',
      'Just a friendly reminder about your appointment tomorrow.',
      'Your appointment is tomorrow. We can\'t wait to see you!',
    ],
    [NotificationType.NEW_MESSAGE]: [
      'You have a new message from our support team.',
      'New message received. Please check your inbox.',
      'You have an unread message waiting for you.',
      'New message from our team. Please take a look.',
      'Message received. We\'re here to help!',
    ],
    [NotificationType.SYSTEM_UPDATE]: [
      'System update: New features are now available!',
      'Update: We\'ve improved our booking system.',
      'New update: Check out the latest improvements.',
      'System update: Enhanced user experience available.',
      'Update: New features and improvements are live!',
    ],
  };

  const typeMessages = messages[type] || ['You have a new notification.'];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

// Helper function to generate notification titles
function generateNotificationTitle(type: NotificationType): string {
  const titles = {
    [NotificationType.APPOINTMENT_CONFIRMED]: 'Appointment Confirmed',
    [NotificationType.APPOINTMENT_CANCELLED]: 'Appointment Cancelled',
    [NotificationType.APPOINTMENT_REMINDER]: 'Appointment Reminder',
    [NotificationType.NEW_MESSAGE]: 'New Message',
    [NotificationType.SYSTEM_UPDATE]: 'System Update',
  };

  return titles[type] || 'Notification';
}

export async function seedNotifications() {
  console.log('🌱 Starting notification seeding...');

  try {
    // Get users to create notifications for
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    // Get bookings to create appointment-related notifications
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: { id: true },
        },
        service: {
          select: { name: true },
        },
        partner: {
          select: { name: true },
        },
      },
    });

    if (users.length === 0) {
      console.log('⚠️  No active users found. Please seed users first.');
      return;
    }

    // Clear existing notifications (optional - remove if you want to keep existing data)
    await prisma.notification.deleteMany({});
    console.log('🗑️  Cleared existing notifications');

    const notifications = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date();

    // Create appointment-related notifications for bookings
    for (const booking of bookings) {
      const notificationTypes: NotificationType[] = [
        NotificationType.APPOINTMENT_CONFIRMED,
        NotificationType.APPOINTMENT_REMINDER,
      ];

      // Add cancellation notification for cancelled bookings
      if (booking.status === 'CANCELLED') {
        notificationTypes.push(NotificationType.APPOINTMENT_CANCELLED);
      }

      // Create notifications for each type
      for (const type of notificationTypes) {
        const createdAt = getRandomDate(startDate, endDate);
        const isRead = Math.random() > 0.3; // 70% chance of being read

        const notification = await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: type,
            title: generateNotificationTitle(type),
            message: generateNotificationMessage(type, {
              serviceName: booking.service.name,
              partnerName: booking.partner?.name,
              bookingDate: booking.bookingDate,
            }),
            isRead: isRead,
            data: {
              bookingId: booking.id,
              serviceName: booking.service.name,
              partnerName: booking.partner?.name,
              bookingDate: booking.bookingDate.toISOString(),
              bookingStatus: booking.status,
            },
            createdAt: createdAt,
          },
        });

        notifications.push(notification);
      }
    }

    // Create system update notifications for all users
    const systemUpdateCount = 5; // Number of system updates
    for (let i = 0; i < systemUpdateCount; i++) {
      const createdAt = getRandomDate(startDate, endDate);
      
      // Create system update notification for all users
      for (const user of users) {
        const isRead = Math.random() > 0.4; // 60% chance of being read

        const notification = await prisma.notification.create({
          data: {
            userId: user.id,
            type: NotificationType.SYSTEM_UPDATE,
            title: generateNotificationTitle(NotificationType.SYSTEM_UPDATE),
            message: generateNotificationMessage(NotificationType.SYSTEM_UPDATE),
            isRead: isRead,
            data: {
              updateVersion: `v1.${i + 1}.0`,
              features: ['Improved booking system', 'New payment options', 'Enhanced user interface', 'Better notifications'][i % 4],
            },
            createdAt: createdAt,
          },
        });

        notifications.push(notification);
      }
    }

    // Create new message notifications for some users
    const messageCount = Math.floor(users.length * 0.3); // 30% of users get messages
    const selectedUsers = users
      .sort(() => Math.random() - 0.5)
      .slice(0, messageCount);

    for (const user of selectedUsers) {
      const messageNotifications = Math.floor(Math.random() * 3) + 1; // 1-3 messages per user
      
      for (let i = 0; i < messageNotifications; i++) {
        const createdAt = getRandomDate(startDate, endDate);
        const isRead = Math.random() > 0.2; // 80% chance of being read

        const notification = await prisma.notification.create({
          data: {
            userId: user.id,
            type: NotificationType.NEW_MESSAGE,
            title: generateNotificationTitle(NotificationType.NEW_MESSAGE),
            message: generateNotificationMessage(NotificationType.NEW_MESSAGE),
            isRead: isRead,
            data: {
              messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              sender: 'Support Team',
              priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            },
            createdAt: createdAt,
          },
        });

        notifications.push(notification);
      }
    }

    console.log(`✅ Created ${notifications.length} notifications successfully!`);

    // Display summary by type
    const typeStats = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    console.log('\n📊 Notification Summary by Type:');
    typeStats.forEach((stat) => {
      const percentage = ((stat._count.id / notifications.length) * 100).toFixed(1);
      console.log(`   ${stat.type}: ${stat._count.id} notifications (${percentage}%)`);
    });

    // Display summary by read status
    const readStats = await prisma.notification.groupBy({
      by: ['isRead'],
      _count: {
        id: true,
      },
    });

    console.log('\n📖 Notification Read Status:');
    readStats.forEach((stat) => {
      const status = stat.isRead ? 'Read' : 'Unread';
      const percentage = ((stat._count.id / notifications.length) * 100).toFixed(1);
      console.log(`   ${status}: ${stat._count.id} notifications (${percentage}%)`);
    });

    // Display summary by user
    const userStats = await prisma.notification.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
    });

    console.log('\n👥 Notifications per User:');
    const userNotificationStats = await Promise.all(
      userStats.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.userId },
          select: { firstName: true, lastName: true, email: true },
        });
        return {
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          email: user?.email,
          count: stat._count.id,
        };
      })
    );

    userNotificationStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.name} (${stat.email}): ${stat.count} notifications`);
      });

    // Display summary by month
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as notification_count
      FROM notifications 
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `;

    console.log('\n📅 Monthly Notification Summary:');
    (monthlyStats as any[]).forEach((stat) => {
      const month = new Date(stat.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      console.log(`   ${month}: ${stat.notification_count} notifications`);
    });

    // Show sample notifications
    const sampleNotifications = await prisma.notification.findMany({
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n🎯 Sample Notifications:');
    sampleNotifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title}`);
      console.log(`      User: ${notification.user.firstName} ${notification.user.lastName}`);
      console.log(`      Type: ${notification.type}`);
      console.log(`      Message: ${notification.message}`);
      console.log(`      Read: ${notification.isRead ? 'Yes' : 'No'}`);
      console.log(`      Date: ${notification.createdAt.toLocaleDateString()}`);
    });

    // Show recent notifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentNotifications = await prisma.notification.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    console.log(`\n📅 Recent Notifications (Last 7 days): ${recentNotifications}`);

  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate random date within a range
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedNotifications()
    .then(() => {
      console.log('🎉 Notification seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Notification seeding failed:', error);
      process.exit(1);
    });
}
