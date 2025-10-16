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
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ConnectionManagerService } from './services/connection-manager.service';
import { ChatEvents } from './chat.events';
import { ChatService } from './chat.service';
import { AuditService } from '../audit/audit.service';
import { ValidationPipe } from '@nestjs/common';

@UseGuards(WsJwtGuard)
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

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<string, string> = new Map();
  private onlineUsers: Map<string, any> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private connManager: ConnectionManagerService,
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
      const existingSocketId = this.connManager.getSocketId(userId);
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
      if (this.connManager.getSocketId(userId) === client.id) {
        console.log('Socket', client.id, 'is already connected for user', userId);
        return;
      }

      // Store socket connection AFTER handling old socket
      console.log('Storing socket connection', userId, client.id);
      this.connManager.setConnection(userId, client.id);
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
      if (userInfo) this.connManager.setConnection(userId, client.id, userInfo);

        // Send unread count
        const unreadCount = await this.chatService.getUnreadCount(userId);
        client.emit(ChatEvents.UNREAD_COUNT, { count: unreadCount });
        
        // Notify admin about user online status
        if (userId !== 'admin') {
          this.server.emit(ChatEvents.USER_ONLINE, {
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

      if (isReconnect) this.server.emit(ChatEvents.USER_RECONNECTED, userData);
      else this.server.emit(ChatEvents.USER_CONNECTED, userData);

    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      if (client.data.isActive) {
        const currentSocketId = this.connManager.getSocketId(userId);
        if (currentSocketId === client.id) {
          const timer = setTimeout(() => {
            if (this.connManager.getSocketId(userId) === client.id) {
              this.connManager.removeConnection(userId);
              if (userId !== 'admin') {
                this.server.emit(ChatEvents.USER_DISCONNECTED, { userId });
                this.server.emit(ChatEvents.USER_OFFLINE, { userId, isOnline: false, timestamp: new Date().toISOString() });
              }
            }
            this.disconnectTimers.delete(userId);
          }, 5000);
          this.disconnectTimers.set(userId, timer);
        }
      }
    }
  }

  @SubscribeMessage(ChatEvents.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe({ whitelist: true, transform: true })) data: import('./dto/chat.dto').SendMessageDto,
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

      // Persist message directly via service (no Redis stream)
      await this.chatService.saveMessage({
        senderId,
        receiverId: data.receiverId,
        roomId: data.roomId,
        content: data.content,
        status: 'SENT' as any,
        messageType: (data.messageType as any) || 'TEXT',
      });

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
      client.emit(ChatEvents.MESSAGE_SENT, { success: true, message });

      // Emit to receiver if online
      if (data.receiverId) {
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
          console.log('Emitting to receiver:', data.receiverId);
          this.server.to(receiverSocketId).emit(ChatEvents.NEW_MESSAGE, message);
        } else {
          console.log('Receiver not online:', data.receiverId);
        }
      }

      // Emit to room if specified
      if (data.roomId) {
        console.log('Emitting to room:', data.roomId);
        client.to(data.roomId).emit(ChatEvents.NEW_MESSAGE, message);
      }

      // Emit to admin if connected (for monitoring)
      const adminSocketId = this.userSockets.get('admin');
      if (adminSocketId) {
        console.log('Emitting to admin:', adminSocketId);
        this.server.to(adminSocketId).emit(ChatEvents.NEW_MESSAGE, message);
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
    @MessageBody(new ValidationPipe({ whitelist: true, transform: true })) data: import('./dto/chat.dto').JoinRoomDto,
  ) {
    client.join(data.roomId);
    console.log(`User ${client.data.userId} joined room ${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe({ whitelist: true, transform: true })) data: import('./dto/chat.dto').LeaveRoomDto,
  ) {
    client.leave(data.roomId);
    console.log(`User ${client.data.userId} left room ${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe({ whitelist: true, transform: true })) data: import('./dto/chat.dto').MarkAsReadDto,
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
    @MessageBody(new ValidationPipe({ whitelist: true, transform: true })) data: import('./dto/chat.dto').TypingDto,
  ) {
    console.log(`User ${client.data.userId} is typing to ${data.receiverId}`);
    if (data.receiverId) {
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit(ChatEvents.USER_TYPING, {
          userId: client.data.userId,
          isTyping: data.isTyping,
        });
      }
    }

    if (data.roomId) {
      client.to(data.roomId).emit(ChatEvents.USER_TYPING, {
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
