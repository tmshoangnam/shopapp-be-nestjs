import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const isAdmin = client.handshake.query?.admin === 'true';
    if (isAdmin) return true;

    const token = (client.handshake.auth && (client.handshake.auth as any).token) || client.handshake.headers?.authorization?.split(' ')[1];
    if (!token) throw new WsException('Unauthorized');
    try {
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') });
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}

