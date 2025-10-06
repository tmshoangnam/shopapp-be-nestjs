import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(data: {
    senderId: string;
    receiverId?: string;
    roomId?: string;
    content: string;
  }) {
    return this.prisma.chatMessage.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getMessages(params: {
    roomId?: string;
    senderId?: string;
    receiverId?: string;
    skip?: number;
    take?: number;
  }) {
    const { roomId, senderId, receiverId, skip = 0, take = 50 } = params;

    const where: any = {};

    if (roomId) {
      where.roomId = roomId;
    } else if (senderId && receiverId) {
      where.OR = [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ];
    }

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.chatMessage.count({ where }),
    ]);

    return { data: messages, total };
  }

  async markAsRead(messageIds: string[]) {
    return this.prisma.chatMessage.updateMany({
      where: {
        id: { in: messageIds },
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.chatMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error('Unauthorized or message not found');
    }

    return this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
  }

  async getUserMessages(userId: string, params: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.chatMessage.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      }),
    ]);

    return { data: messages, total };
  }

  async getConversations(userId: string) {
    // Get unique conversations for the user
    const conversations = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Group by conversation partner
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      if (partnerId && !conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner: message.senderId === userId ? null : message.sender,
          lastMessage: message,
          unreadCount: 0,
        });
      }
    });

    // Calculate unread counts
    for (const [partnerId, conversation] of conversationMap) {
      const unreadCount = await this.prisma.chatMessage.count({
        where: {
          senderId: partnerId,
          receiverId: userId,
          isRead: false,
        },
      });
      conversation.unreadCount = unreadCount;
    }

    return Array.from(conversationMap.values());
  }

  async getAllMessages(params: {
    roomId?: string;
    senderId?: string;
    receiverId?: string;
    skip?: number;
    take?: number;
  }) {
    const { roomId, senderId, receiverId, skip = 0, take = 50 } = params;

    const where: any = {};

    if (roomId) {
      where.roomId = roomId;
    } else if (senderId && receiverId) {
      where.OR = [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ];
    }

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.chatMessage.count({ where }),
    ]);

    return { data: messages, total };
  }

  async getOnlineUsers() {
    // This would typically be managed by the WebSocket gateway
    // For now, return a mock response
    return {
      onlineUsers: [],
      totalOnline: 0,
    };
  }

  async getChatStats() {
    const [
      totalMessages,
      unreadMessages,
      totalUsers,
      messagesToday,
    ] = await Promise.all([
      this.prisma.chatMessage.count(),
      this.prisma.chatMessage.count({
        where: { isRead: false },
      }),
      this.prisma.user.count(),
      this.prisma.chatMessage.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalMessages,
      unreadMessages,
      totalUsers,
      messagesToday,
    };
  }
}
