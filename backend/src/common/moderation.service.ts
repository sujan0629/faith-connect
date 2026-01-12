import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { Post, PostDocument } from '../posts/schemas/post.schema';

@Injectable()
export class ModerationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  /**
   * Block a user
   */
  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    if (userId === blockedUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    // Add to blocked users list
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: blockedUserId } },
      { new: true },
    );

    // Add to blocked by list
    await this.userModel.findByIdAndUpdate(
      blockedUserId,
      { $addToSet: { blockedBy: userId } },
      { new: true },
    );
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    // Remove from blocked users list
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { blockedUsers: blockedUserId } },
      { new: true },
    );

    // Remove from blocked by list
    await this.userModel.findByIdAndUpdate(
      blockedUserId,
      { $pull: { blockedBy: userId } },
      { new: true },
    );
  }

  /**
   * Check if user is blocked
   */
  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    return user?.blockedUsers?.includes(targetUserId) ?? false;
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(userId: string): Promise<User[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user?.blockedUsers?.length) return [];

    return this.userModel.find({ _id: { $in: user.blockedUsers } }).exec();
  }

  /**
   * Report a user or post
   */
  async reportContent(userId: string, dto: CreateReportDto): Promise<Report> {
    // Check if already reported
    const existingReport = await this.reportModel.findOne({
      reportedId: dto.reportedId,
      reportedType: dto.reportedType,
      reporterId: userId,
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this content');
    }

    // Validate that reported content exists
    if (dto.reportedType === 'user') {
      const user = await this.userModel.findById(dto.reportedId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } else if (dto.reportedType === 'post') {
      const post = await this.postModel.findById(dto.reportedId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
    }

    const report = new this.reportModel({
      reportedId: dto.reportedId,
      reportedType: dto.reportedType,
      reporterId: userId,
      reason: dto.reason,
      description: dto.description,
      status: 'pending',
    });

    return report.save();
  }

  /**
   * Get user's reports (admin only)
   */
  async getUserReports(status?: string, limit = 50, skip = 0): Promise<Report[]> {
    const query = status ? { status } : {};
    return this.reportModel.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).exec();
  }

  /**
   * Resolve a report
   */
  async resolveReport(
    reportId: string,
    resolved: boolean,
    adminNotes?: string,
  ): Promise<Report> {
    const report = await this.reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = resolved ? 'resolved' : 'dismissed';
    report.adminNotes = adminNotes;

    // If resolving by banning, update the reported content
    if (resolved) {
      report.isBanned = true;
      if (report.reportedType === 'user') {
        await this.userModel.findByIdAndUpdate(report.reportedId, { status: 'banned' });
      } else if (report.reportedType === 'post') {
        await this.postModel.findByIdAndUpdate(report.reportedId, { isActive: false });
      }
    }

    return report.save();
  }
}
