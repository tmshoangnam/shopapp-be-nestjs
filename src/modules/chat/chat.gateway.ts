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

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
        if (oldSocket) {
          oldSocket.disconnect();
        }
      }

      // Store socket connection
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;
      client.data.isAdmin = false;

      console.log(`User ${userId} ${isReconnect ? 'reconnected' : 'connected'} with socket ${client.id}`);

      // Send unread count
      const unreadCount = await this.chatService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });

      // Notify admin about user connection/reconnection
      const userData = {
        userId,
        socketId: client.id,
        userInfo: {
          firstName: payload.firstName || 'User',
          lastName: payload.lastName || '',
          email: payload.email || ''
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

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
      
      // Notify admin about user disconnection
      if (userId !== 'admin') {
        this.server.emit('user-disconnected', { userId });
      }
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId?: string; roomId?: string; content: string },
  ) {
    const senderId = client.data.userId;
    console.log('send-message', client.data);
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Save message to database
      const message = await this.chatService.saveMessage({
        senderId,
        receiverId: data.receiverId,
        roomId: data.roomId,
        content: data.content,
      });

      console.log('Message saved to DB:', message);
      console.log('Sender ID:', senderId);
      console.log('Receiver ID:', data.receiverId);

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

      // Note: Removed message-broadcast to avoid duplicates
      // Each client will receive messages via new-message event

      return { success: true, message };
    } catch (error) {
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
}
