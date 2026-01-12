import { BadRequestException, Body, Controller, Get, Patch, Post, Delete, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDtoSchema } from './dto/update-settings.dto';
import { ModerationService } from '../common/moderation.service';
import { CreateReportDtoSchema } from '../common/dto/create-report.dto';
import type { UserDocument } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private moderationService: ModerationService,
  ) {}

  @Get('me')
  async getMe(@AuthUser() user: UserDocument) {
    const found = await this.usersService.findById(user.id);
    return this.sanitize(found);
  }

  @Get('me/stats')
  async getProfileStats(@AuthUser() user: UserDocument) {
    return this.usersService.getProfileStats(user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @AuthUser() requester: UserDocument) {
    const found = await this.usersService.findPublicById(id);
    const stats = await this.usersService.getProfileStats(id);

    const sanitized = this.sanitize(found);
    if (!sanitized) return null;

    return {
      ...sanitized,
      followersCount: stats?.followersCount ?? 0,
      followingCount: stats?.followingCount ?? 0,
      isFollowing: requester.following?.includes(id) ?? false,
    };
  }

  @Patch('me')
  async updateProfile(@AuthUser() user: UserDocument, @Body() dto: UpdateProfileDto) {
    try {
      const updated = await this.usersService.updateProfile(user.id, dto);
      return this.sanitize(updated);
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.username) {
        throw new BadRequestException('Username already taken');
      }
      throw error;
    }
  }

  private sanitize(user?: UserDocument | null) {
    if (!user) return null;
    const { passwordHash, magicTokenHash, signupCodeHash, refreshTokenHash, ...rest } = user.toObject();
    return { id: user.id, ...rest };
  }

  /**
   * Block a user
   */
  @Post(':userId/block')
  async blockUser(
    @AuthUser() user: UserDocument,
    @Param('userId') blockedUserId: string,
  ) {
    await this.moderationService.blockUser(user.id, blockedUserId);
    return { success: true, message: 'User blocked' };
  }

  /**
   * Unblock a user
   */
  @Delete(':userId/block')
  async unblockUser(
    @AuthUser() user: UserDocument,
    @Param('userId') blockedUserId: string,
  ) {
    await this.moderationService.unblockUser(user.id, blockedUserId);
    return { success: true, message: 'User unblocked' };
  }

  /**
   * Get blocked users
   */
  @Get('me/blocked')
  async getBlockedUsers(@AuthUser() user: UserDocument) {
    const blockedUsers = await this.moderationService.getBlockedUsers(user.id);
    return blockedUsers.map((u: UserDocument) => this.sanitize(u));
  }

  /**
   * Report a user or post
   */
  @Post('report')
  async reportContent(
    @AuthUser() user: UserDocument,
    @Body() body: any,
  ) {
    try {
      const dto = CreateReportDtoSchema.parse(body);
      const report = await this.moderationService.reportContent(user.id, dto);
      const reportId = ((report as any)._id || (report as any).id) as string;
      return { success: true, reportId };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }

  /**
   * Get user settings
   */
  @Get('me/settings')
  async getSettings(@AuthUser() user: UserDocument) {
    const found = await this.usersService.findById(user.id);
    if (!found) return null;

    return {
      notificationsEnabled: found.notificationsEnabled ?? true,
      emailNotificationsEnabled: found.emailNotificationsEnabled ?? true,
      allowMessagesFromAnyone: found.allowMessagesFromAnyone ?? true,
      privateProfile: found.privateProfile ?? false,
      allowComments: found.allowComments ?? true,
      whoCanLike: found.whoCanLike ?? 'everyone',
      blockedContentTopics: found.blockedContentTopics ?? [],
    };
  }

  /**
   * Update user settings
   */
  @Patch('me/settings')
  async updateSettings(@AuthUser() user: UserDocument, @Body() body: any) {
    try {
      const dto = UpdateSettingsDtoSchema.parse(body);
      const updated = await this.usersService.updateSettings(user.id, dto);
      
      return {
        notificationsEnabled: updated?.notificationsEnabled ?? true,
        emailNotificationsEnabled: updated?.emailNotificationsEnabled ?? true,
        allowMessagesFromAnyone: updated?.allowMessagesFromAnyone ?? true,
        privateProfile: updated?.privateProfile ?? false,
        allowComments: updated?.allowComments ?? true,
        whoCanLike: updated?.whoCanLike ?? 'everyone',
        blockedContentTopics: updated?.blockedContentTopics ?? [],
      };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }
}
