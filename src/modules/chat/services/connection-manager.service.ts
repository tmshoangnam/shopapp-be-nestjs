import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionManagerService {
  private userSockets = new Map<string, string>();
  private onlineUsers = new Map<string, any>();

  getSocketId(userId: string) {
    return this.userSockets.get(userId);
  }

  setConnection(userId: string, socketId: string, userInfo?: any) {
    this.userSockets.set(userId, socketId);
    if (userInfo) {
      this.onlineUsers.set(userId, { ...userInfo, socketId, isOnline: true, lastSeen: new Date().toISOString() });
    }
  }

  removeConnection(userId: string) {
    this.userSockets.delete(userId);
    this.onlineUsers.delete(userId);
  }

  allOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }

  isCurrentSocket(userId: string, socketId: string) {
    return this.userSockets.get(userId) === socketId;
  }
}

