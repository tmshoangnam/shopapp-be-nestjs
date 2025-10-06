import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, NotificationFilterDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data,
    });
  }

  async findAll(userId: string, filter: NotificationFilterDto) {
    const { page = 1, limit = 20, isRead, type } = filter;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async removeAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // Helper methods to create specific notification types
  async notifyAppointmentConfirmed(userId: string, appointmentId: string) {
    return this.create({
      userId,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmed',
      message: 'Your appointment has been confirmed.',
      data: { appointmentId },
    });
  }

  async notifyAppointmentCancelled(userId: string, appointmentId: string) {
    return this.create({
      userId,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: 'Your appointment has been cancelled.',
      data: { appointmentId },
    });
  }

  async notifyAppointmentReminder(userId: string, appointmentId: string) {
    return this.create({
      userId,
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Reminder',
      message: 'You have an upcoming appointment.',
      data: { appointmentId },
    });
  }

  async notifyNewMessage(userId: string, senderId: string) {
    return this.create({
      userId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: 'You have received a new message.',
      data: { senderId },
    });
  }

  async notifySystemUpdate(userId: string, message: string) {
    return this.create({
      userId,
      type: 'SYSTEM_UPDATE',
      title: 'System Update',
      message,
    });
  }
}
