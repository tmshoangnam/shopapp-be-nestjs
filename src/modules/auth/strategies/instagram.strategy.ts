import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-instagram';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Instagram OAuth authentication strategy
 * Handles user authentication via Instagram OAuth provider
 */
@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('INSTAGRAM_CLIENT_ID') || 'dummy-instagram-id',
      clientSecret: configService.get('INSTAGRAM_CLIENT_SECRET') || 'dummy-instagram-secret',
      callbackURL: configService.get('INSTAGRAM_CALLBACK_URL') || 'http://localhost:4000/api/v1/auth/instagram/callback',
      scope: ['user_profile', 'user_media'],
    });
  }

  /**
   * Validates Instagram OAuth profile and creates or updates user
   * @param accessToken - Instagram access token
   * @param refreshToken - Instagram refresh token
   * @param profile - Instagram user profile data
   * @returns User object from database
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, displayName, _json } = profile;

    // Try to find user by Instagram ID
    let user = await this.prisma.user.findUnique({
      where: { instagramId: id },
    });

    // Generate email from username
    const email = `instagram_${username}@shopapp.app`;

    // Create or update user
    if (user) {
      // Update existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          instagramId: id,
          avatar: _json.profile_picture || user.avatar,
          lastLogin: new Date(),
        },
      });
    } else {
      // Check if email exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link Instagram to existing account
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            instagramId: id,
            avatar: _json.profile_picture || existingUser.avatar,
            lastLogin: new Date(),
          },
        });
      } else {
        // Create new user
        const nameParts = (displayName || username || 'Instagram User').split(' ');
        user = await this.prisma.user.create({
          data: {
            email,
            instagramId: id,
            firstName: nameParts[0] || 'Instagram',
            lastName: nameParts.slice(1).join(' ') || 'User',
            avatar: _json.profile_picture,
            isVerified: true,
            lastLogin: new Date(),
          },
        });
      }
    }

    return user;
  }
}
