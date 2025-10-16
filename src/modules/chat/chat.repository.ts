import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageStatus, MessageType } from '@prisma/client';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  createMessage(data: {
    senderId: string;
    receiverId?: string | null;
    roomId?: string | null;
    content: string;
    status?: MessageStatus;
    messageType?: MessageType;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        ...data,
        status: data.status || 'SENT',
        messageType: data.messageType || 'TEXT',
      },
      include: {
        sender: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  findMessages(where: any, skip = 0, take = 50, order: 'asc' | 'desc' = 'asc') {
    return this.prisma.chatMessage.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: order },
      include: {
        sender: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  countMessages(where: any) {
    return this.prisma.chatMessage.count({ where });
  }

  markAsRead(messageIds: string[]) {
    return this.prisma.chatMessage.updateMany({ where: { id: { in: messageIds } }, data: { status: 'READ' } });
  }

  markAsDelivered(messageIds: string[]) {
    return this.prisma.chatMessage.updateMany({ where: { id: { in: messageIds }, status: 'SENT' }, data: { status: 'DELIVERED' } });
  }
}

