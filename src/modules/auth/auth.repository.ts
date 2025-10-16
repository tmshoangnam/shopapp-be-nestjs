import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); }
  createUser(data: any) { return this.prisma.user.create({ data }); }
  updateUser(id: string, data: any) { return this.prisma.user.update({ where: { id }, data }); }
  createSession(data: any) { return this.prisma.session.create({ data }); }
  deleteSessionById(id: string) { return this.prisma.session.delete({ where: { id } }); }
  deleteSessions(where: any) { return this.prisma.session.deleteMany({ where }); }
  findSessionByRefreshToken(refreshToken: string) {
    return this.prisma.session.findUnique({ where: { refreshToken }, include: { user: true } });
  }
}

