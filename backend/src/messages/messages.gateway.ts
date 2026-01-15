import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('MessagesGateway');
  private socketUserMap = new Map<string, string>();

  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || (client.handshake.query && (client.handshake.query.token as string));
      if (!token) {
        this.logger.warn('Client connected without token, disconnecting');
        client.disconnect(true);
        return;
      }
      // Prefer ConfigService for retrieving secrets; fall back to process.env
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        this.logger.warn('JWT_ACCESS_SECRET not set in config; disconnecting client');
        client.disconnect(true);
        return;
      }

      let payload: any;
      try {
        payload = jwt.verify(token, secret) as { sub: string };
      } catch (err) {
        this.logger.warn('JWT verification failed: ' + (err as any)?.message);
        client.disconnect(true);
        return;
      }
      const userId = payload.sub;
      this.socketUserMap.set(client.id, userId);
      client.join(this.getRoomForUser(userId));
      this.logger.log(`Socket connected: ${client.id} (user ${userId})`);
    } catch (error: any) {
      this.logger.warn('Socket authentication failed: ' + (error?.message || error));
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    this.socketUserMap.delete(client.id);
    this.logger.log(`Socket disconnected: ${client.id} (user ${userId})`);
  }

  getRoomForUser(userId: string) {
    return `user:${userId}`;
  }

  emitMessageToUser(userId: string, payload: any) {
    if (!userId) return;
    const room = this.getRoomForUser(userId);
    this.server.to(room).emit('message:new', payload);
  }
}
