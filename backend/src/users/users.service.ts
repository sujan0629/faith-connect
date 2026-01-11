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
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          ...payload,
          hasProfile: true,
          onboardingCompleted: payload.onboardingCompleted ?? true,
        },
        { new: true },
      )
      .exec();
  }
}
