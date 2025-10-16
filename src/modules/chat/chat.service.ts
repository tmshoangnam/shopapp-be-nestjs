import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { ChatRepository } from './chat.repository';
import { MessageStatus, MessageType, RoomType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private readonly chatRepository: ChatRepository,
  ) {}

  async saveMessage(data: {
    senderId: string;
    receiverId?: string;
    roomId?: string;
    content: string;
    status?: MessageStatus;
    messageType?: MessageType;
  }) {
    return this.chatRepository.createMessage(data);
  }

  async sendMessage(data: { senderId: string; receiverId?: string; roomId?: string; content: string; messageType?: MessageType }) {
    const saved = await this.saveMessage({
      senderId: data.senderId,
      receiverId: data.receiverId,
      roomId: data.roomId,
      content: data.content,
      messageType: data.messageType || MessageType.TEXT,
      status: MessageStatus.SENT,
    });
    return saved;
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
      this.chatRepository.findMessages(where, skip, take, 'asc'),
      this.chatRepository.countMessages(where),
    ]);

    return { data: messages, total };
  }

  async markAsRead(messageIds: string[]) {
    return this.chatRepository.markAsRead(messageIds);
  }

  async getUnreadCount(userId: string) {
    return this.prisma.chatMessage.count({
      where: {
        receiverId: userId,
        status: {
          in: [MessageStatus.SENT, MessageStatus.DELIVERED],
        },
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

    const where = { OR: [{ senderId: userId }, { receiverId: userId }] };
    const [messages, total] = await Promise.all([
      this.chatRepository.findMessages(where, skip, take, 'desc'),
      this.chatRepository.countMessages(where),
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
          status: {
            in: [MessageStatus.SENT, MessageStatus.DELIVERED],
          },
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
      this.chatRepository.findMessages(where, skip, take, 'desc'),
      this.chatRepository.countMessages(where),
    ]);

    return { data: messages, total };
  }

  async getOnlineUsers() {
    // Get online users from Redis
    try {
      const onlineUsers = await this.redis.get('online_users');
      if (onlineUsers) {
        const users = JSON.parse(onlineUsers);
        return {
          onlineUsers: users,
          totalOnline: users.length,
        };
      }
    } catch (error) {
      console.error('Error getting online users from Redis:', error);
    }
    
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
        where: { 
          status: {
            in: [MessageStatus.SENT, MessageStatus.DELIVERED],
          },
        },
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

  // Room Management Methods
  async createRoom(data: {
    name?: string;
    type?: RoomType;
    description?: string;
  }) {
    return this.prisma.room.create({
      data: {
        name: data.name,
        type: data.type || RoomType.DIRECT,
        description: data.description,
      },
    });
  }

  async getRoom(roomId: string) {
    return this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        messages: {
          take: 50,
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
        },
      },
    });
  }

  async getRooms(params: {
    type?: string;
    skip?: number;
    take?: number;
  }) {
    const { type, skip = 0, take = 50 } = params;

    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.room.count({ where }),
    ]);

    return { data: rooms, total };
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    return this.prisma.chatMessage.update({ where: { id: messageId }, data: { status } });
  }

  async markAsDelivered(messageIds: string[]) {
    return this.chatRepository.markAsDelivered(messageIds);
  }

  async updateOnlineUsers(onlineUsers: any[]) { /* no-op: removed Redis caching */ }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
      },
    });
  }
}
