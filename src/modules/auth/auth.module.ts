import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { LineStrategy } from './strategies/line.strategy';
import { InstagramStrategy } from './strategies/instagram.strategy';
import { RolesGuard } from './guards/roles.guard';
import { RoleHierarchyGuard } from './guards/role-hierarchy.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    GithubStrategy,
    LineStrategy,
    InstagramStrategy,
    RolesGuard,
    RoleHierarchyGuard,
  ],
  exports: [AuthService, AuthRepository, JwtModule, RolesGuard, RoleHierarchyGuard],
})
export class AuthModule {}
