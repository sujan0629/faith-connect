import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findPublicById(id: string) {
    return this.userModel
      .findById(id)
      .select('-passwordHash -magicTokenHash -signupCodeHash -refreshTokenHash')
      .exec();
  }

  async ensurePendingUser(email: string, role: Role) {
    const existing = await this.findByEmail(email);
    if (existing) return existing;
    return this.userModel.create({ email: email.toLowerCase(), role, status: 'pending', hasProfile: false });
  }

  async setSignupCode(userId: string, codeHash: string, expiresAt: Date) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          signupCodeHash: codeHash,
          signupCodeExpiresAt: expiresAt,
          signupCodeVerifiedAt: null,
        },
        { new: true },
      )
      .exec();
  }

  async markSignupVerified(userId: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { signupCodeVerifiedAt: new Date() }, { new: true })
      .exec();
  }

  async activateUser(userId: string, passwordHash: string, name?: string, role?: Role) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          passwordHash,
          name,
          role,
          status: 'active',
          signupCodeHash: null,
          signupCodeExpiresAt: null,
          signupCodeVerifiedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async setMagicToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          magicTokenHash: tokenHash,
          magicTokenExpiresAt: expiresAt,
        },
        { new: true },
      )
      .exec();
  }

  async clearMagicToken(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          magicTokenHash: null,
          magicTokenExpiresAt: null,
        },
        { new: true },
      )
      .exec();
  }

  async setRefreshToken(userId: string, refreshTokenHash: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { refreshTokenHash }, { new: true })
      .exec();
  }

  async clearRefreshToken(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null }, { new: true }).exec();
  }

  async updateProfile(userId: string, payload: UpdateProfileDto) {
    const updateData: any = {};
    
    // Only add fields that are provided
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.username !== undefined) updateData.username = payload.username;
    if (payload.bio !== undefined) updateData.bio = payload.bio;
    if (payload.faith !== undefined) updateData.faith = payload.faith;
    if (payload.denomination !== undefined) updateData.denomination = payload.denomination;
    if (payload.avatar !== undefined) updateData.avatar = payload.avatar;
    if (payload.contentFocus !== undefined) updateData.contentFocus = payload.contentFocus;
    if (payload.audiencePrefs !== undefined) updateData.audiencePrefs = payload.audiencePrefs;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.onboardingCompleted !== undefined) updateData.onboardingCompleted = payload.onboardingCompleted;
    
    updateData.hasProfile = true;
    updateData.onboardingCompleted = updateData.onboardingCompleted ?? true;

    return this.userModel
      .findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true },
      )
      .exec();
  }

  async followLeader(userId: string, leaderId: string) {
    // Add leader to user's following array
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { following: leaderId } }
    ).exec();

    // Add user to leader's followers array
    await this.userModel.findByIdAndUpdate(
      leaderId,
      { $addToSet: { followers: userId } }
    ).exec();
  }

  async unfollowLeader(userId: string, leaderId: string) {
    // Remove leader from user's following array
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { following: leaderId } }
    ).exec();

    // Remove user from leader's followers array
    await this.userModel.findByIdAndUpdate(
      leaderId,
      { $pull: { followers: userId } }
    ).exec();
  }

  async getFollowers(leaderId: string) {
    const leader = await this.userModel.findById(leaderId).exec();
    if (!leader || !leader.followers) return [];

    // Get follower user details
    return this.userModel
      .find({ _id: { $in: leader.followers } })
      .select('id name username avatar bio faith')
      .exec();
  }

  async getFollowing(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.following) return [];

    // Get following user details
    return this.userModel
      .find({ _id: { $in: user.following } })
      .select('id name username avatar bio faith role')
      .exec();
  }

  async getLeaders(filters?: { faith?: string; search?: string }) {
    const query: any = { role: 'leader', status: 'active' };

    if (filters?.faith && filters.faith !== 'All Faiths') {
      query.faith = filters.faith;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { faith: { $regex: filters.search, $options: 'i' } },
        { bio: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.userModel
      .find(query)
      .select('id name username avatar bio faith denomination followers')
      .sort({ 'followers.length': -1, createdAt: -1 })
      .exec();
  }

  async getProfileStats(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;

    const followingCount = user.following?.length || 0;
    const followersCount = user.followers?.length || 0;

    return {
      followingCount,
      followersCount,
    };
  }

  async updateSettings(userId: string, dto: any) {
    const updateData: any = {};
    
    if (dto.notificationsEnabled !== undefined) updateData.notificationsEnabled = dto.notificationsEnabled;
    if (dto.emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = dto.emailNotificationsEnabled;
    if (dto.allowMessagesFromAnyone !== undefined) updateData.allowMessagesFromAnyone = dto.allowMessagesFromAnyone;
    if (dto.privateProfile !== undefined) updateData.privateProfile = dto.privateProfile;
    if (dto.allowComments !== undefined) updateData.allowComments = dto.allowComments;
    if (dto.whoCanLike !== undefined) updateData.whoCanLike = dto.whoCanLike;
    if (dto.blockedContentTopics !== undefined) updateData.blockedContentTopics = dto.blockedContentTopics;

    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
  }
}
