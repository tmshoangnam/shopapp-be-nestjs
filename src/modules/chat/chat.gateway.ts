import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { RedisService } from '../common/redis/redis.service';
import { AuditService } from '../audit/audit.service';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private onlineUsers: Map<string, any> = new Map(); // userId -> userInfo

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
    private auditService: AuditService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Check if this is an admin connection
      const isAdmin = client.handshake.query?.admin === 'true';
      
      if (isAdmin) {
        // Admin connection - no token required
        client.data.userId = 'admin';
        client.data.isAdmin = true;
        
        // Store admin socket connection
        this.userSockets.set('admin', client.id);
        
        console.log(`Admin connected with socket ${client.id}`);
        console.log('Admin stored in userSockets:', this.userSockets.has('admin'));
        
        // Notify all clients about admin connection
        this.server.emit('admin-connected', { adminId: client.id });
        return;
      }

      // Extract and verify JWT token for regular users
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        console.log('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const userId = payload.sub;
      
      // Check if user already exists and handle reconnect
      const existingSocketId = this.userSockets.get(userId);
      const isReconnect = existingSocketId !== undefined;

      // If user exists, disconnect old socket first
      if (isReconnect && existingSocketId !== client.id) {
        const oldSocket = this.server.sockets.sockets.get(existingSocketId);
        if (oldSocket && oldSocket.connected) {
          console.log('Disconnecting old socket', existingSocketId, 'for user', userId);
          // Mark old socket as inactive to prevent processing its disconnect event
          oldSocket.data.isActive = false;
          // Disconnect immediately to prevent multiple connections
          oldSocket.disconnect(true);
        } else {
          console.log('Old socket', existingSocketId, 'is already disconnected for user', userId);
        }
      }

      // Check if this socket is already connected (prevent duplicate connections)
      if (this.userSockets.has(userId) && this.userSockets.get(userId) === client.id) {
        console.log('Socket', client.id, 'is already connected for user', userId);
        return;
      }

      // Store socket connection AFTER handling old socket
      console.log('Storing socket connection', userId, client.id);
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;
      client.data.isAdmin = false;
      client.data.email = payload.email;
      client.data.firstName = payload.firstName;
      client.data.lastName = payload.lastName;
      client.data.avatar = payload.avatar;
      
      // Add a flag to prevent duplicate processing
      client.data.isActive = true;

      console.log(`User ${userId} ${isReconnect ? 'reconnected' : 'connected'} with socket ${client.id}`);

      // Get user info from database
      const userInfo = await this.chatService.getUserById(userId);
      if (userInfo) {
        this.onlineUsers.set(userId, {
          ...userInfo,
          socketId: client.id,
          isOnline: true,
          lastSeen: new Date().toISOString()
        });
        
        // Update online users in Redis
        await this.chatService.updateOnlineUsers(Array.from(this.onlineUsers.values()));
      }

        // Send unread count
        const unreadCount = await this.chatService.getUnreadCount(userId);
        client.emit('unread-count', { count: unreadCount });
        
        // Notify admin about user online status
        if (userId !== 'admin') {
          this.server.emit('user-online', {
            userId: userId,
            userInfo: userInfo,
            isOnline: true,
            timestamp: new Date().toISOString()
          });
        }

      // Notify admin about user connection/reconnection
      const userData = {
        userId,
        socketId: client.id,
        userInfo: {
          firstName: payload.firstName || 'User',
          lastName: payload.lastName || '',
          email: payload.email || '',
          avatar: payload.avatar || null
        }
      };

      if (isReconnect) {
        this.server.emit('user-reconnected', userData);
      } else {
        this.server.emit('user-connected', userData);
      }

    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      // Only process disconnect if this socket is still active
      if (client.data.isActive) {
        // Only remove from maps if this is the current active socket for the user
        const currentSocketId = this.userSockets.get(userId);
        if (currentSocketId === client.id) {
          this.userSockets.delete(userId);
          this.onlineUsers.delete(userId);
          
          // Update online users in Redis
          await this.chatService.updateOnlineUsers(Array.from(this.onlineUsers.values()));
          
          console.log(`User ${userId} disconnected (socket ${client.id})`);
          
          // Notify admin about user disconnection
          if (userId !== 'admin') {
            this.server.emit('user-disconnected', { userId });
            this.server.emit('user-offline', {
              userId: userId,
              isOnline: false,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          console.log(`Ignoring disconnect for old socket ${client.id} of user ${userId} (current: ${currentSocketId})`);
        }
      } else {
        console.log(`Ignoring disconnect for inactive socket ${client.id} of user ${userId}`);
      }
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId?: string; roomId?: string; content: string; messageType?: string },
  ) {
    const senderId = client.data.userId;
    console.log('send-message', data);
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Generate message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const messageData = {
        id: messageId,
        roomId: data.roomId || null,
        senderId,
        receiverId: data.receiverId || null,
        content: data.content,
        status: 'SENT',
        messageType: data.messageType || 'TEXT',
        createdAt: new Date().toISOString(),
      };

      // Publish message to Redis stream for persistence
      await this.redis.publishToStream('chat_stream', {
        data: JSON.stringify(messageData),
      });

      console.log('Message published to Redis stream:', messageId);

      // Create message object for real-time delivery
      const message = {
        id: messageId,
        roomId: data.roomId,
        senderId,
        receiverId: data.receiverId,
        content: data.content,
        status: 'SENT',
        messageType: data.messageType || 'TEXT',
        createdAt: new Date(),
        sender: {
          id: senderId,
          email: client.data.email || '',
          firstName: client.data.firstName || 'User',
          lastName: client.data.lastName || '',
          avatar: client.data.avatar || null,
        },
      };

      // Emit to sender (confirmation)
      client.emit('message-sent', { success: true, message });

      // Emit to receiver if online
      if (data.receiverId) {
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
          console.log('Emitting to receiver:', data.receiverId);
          this.server.to(receiverSocketId).emit('new-message', message);
        } else {
          console.log('Receiver not online:', data.receiverId);
        }
      }

      // Emit to room if specified
      if (data.roomId) {
        console.log('Emitting to room:', data.roomId);
        client.to(data.roomId).emit('new-message', message);
      }

      // Emit to admin if connected (for monitoring)
      const adminSocketId = this.userSockets.get('admin');
      if (adminSocketId) {
        console.log('Emitting to admin:', adminSocketId);
        this.server.to(adminSocketId).emit('new-message', message);
      } else {
        console.log('Admin not connected');
      }

      // Log chat message event for audit
      await this.auditService.logChatMessage(
        senderId,
        messageId,
        data.roomId,
        data.receiverId,
        client.handshake.address,
      );

      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    console.log(`User ${client.data.userId} joined room ${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    console.log(`User ${client.data.userId} left room ${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[] },
  ) {
    try {
      await this.chatService.markAsRead(data.messageIds);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId?: string; roomId?: string; isTyping: boolean },
  ) {
    console.log(`User ${client.data.userId} is typing to ${data.receiverId}`);
    if (data.receiverId) {
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('user-typing', {
          userId: client.data.userId,
          isTyping: data.isTyping,
        });
      }
    }

    if (data.roomId) {
      client.to(data.roomId).emit('user-typing', {
        userId: client.data.userId,
        isTyping: data.isTyping,
      });
    }

    return { success: true };
  }

  // Method to get current online users
  getOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }

  // Method to get online user count
  getOnlineUserCount() {
    return this.onlineUsers.size;
  }
}
