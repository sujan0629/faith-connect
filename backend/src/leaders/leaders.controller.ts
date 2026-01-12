import { Controller, Get, Post, Delete, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { GetLeadersDto } from './dto/get-leaders.dto';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('leaders')
@UseGuards(JwtAuthGuard)
export class LeadersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getLeaders(
    @Query() filters: GetLeadersDto,
    @AuthUser() user: UserDocument,
  ) {
    const leaders = await this.usersService.getLeaders(filters);

    // Add isFollowed flag for each leader
    const leadersWithFollowStatus = leaders.map(leader => ({
      id: leader.id,
      name: leader.name,
      username: leader.username,
      avatar: leader.avatar,
      bio: leader.bio,
      faith: leader.faith,
      denomination: leader.denomination,
      followersCount: leader.followers?.length || 0,
      isFollowed: user.following?.includes(leader.id) || false,
    }));

    return leadersWithFollowStatus;
  }

  @Post(':leaderId/follow')
  async followLeader(
    @Param('leaderId') leaderId: string,
    @AuthUser() user: UserDocument,
  ) {
    await this.usersService.followLeader(user.id, leaderId);
    return { success: true };
  }

  @Delete(':leaderId/follow')
  async unfollowLeader(
    @Param('leaderId') leaderId: string,
    @AuthUser() user: UserDocument,
  ) {
    await this.usersService.unfollowLeader(user.id, leaderId);
    return { success: true };
  }

  @Get(':leaderId/followers')
  async getFollowers(@Param('leaderId') leaderId: string) {
    const followers = await this.usersService.getFollowers(leaderId);
    return followers.map(follower => ({
      id: follower.id,
      name: follower.name,
      username: follower.username,
      avatar: follower.avatar,
      bio: follower.bio,
      faith: follower.faith,
    }));
  }

  @Get('following')
  async getFollowing(@AuthUser() user: UserDocument) {
    const following = await this.usersService.getFollowing(user.id);
    return following.map(leader => ({
      id: leader.id,
      name: leader.name,
      username: leader.username,
      avatar: leader.avatar,
      bio: leader.bio,
      faith: leader.faith,
      role: leader.role,
    }));
  }
}