import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-line-auth';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * LINE OAuth authentication strategy
 * Handles user authentication via LINE OAuth provider
 */
@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, 'line') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      channelID: configService.get('LINE_CHANNEL_ID') || 'dummy-line-id',
      channelSecret: configService.get('LINE_CHANNEL_SECRET') || 'dummy-line-secret',
      callbackURL: configService.get('LINE_CALLBACK_URL') || 'http://localhost:4000/api/v1/auth/line/callback',
      scope: ['profile', 'openid', 'email'],
    });
  }

  /**
   * Validates LINE OAuth profile and creates or updates user
   * @param accessToken - LINE access token
   * @param refreshToken - LINE refresh token
   * @param profile - LINE user profile data
   * @returns User object from database
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, displayName, pictureUrl, emails } = profile;

    // Try to find user by LINE ID
    let user = await this.prisma.user.findUnique({
      where: { lineId: id },
    });

    // If not found, try to find by email or generate default email
    const email = emails && emails[0] ? emails[0].value : `line_${id}@shopapp.app`;
    
    if (!user && emails && emails[0]) {
      user = await this.prisma.user.findUnique({
        where: { email: email },
      });
    }

    // Create or update user
    if (user) {
      // Update existing user with LINE ID
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lineId: id,
          avatar: pictureUrl || user.avatar,
          lastLogin: new Date(),
        },
      });
    } else {
      // Create new user
      const nameParts = displayName ? displayName.split(' ') : ['LINE', 'User'];
      user = await this.prisma.user.create({
        data: {
          email,
          lineId: id,
          firstName: nameParts[0] || 'LINE',
          lastName: nameParts.slice(1).join(' ') || 'User',
          avatar: pictureUrl,
          isVerified: true,
          lastLogin: new Date(),
        },
      });
    }

    return user;
  }
}
