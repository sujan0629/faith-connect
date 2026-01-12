import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationModel
      .find({ recipientId: userId })
      .populate('actorId', 'username avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return notifications.map((notif: any) => ({
      id: notif._id.toString(),
      recipientId: notif.recipientId.toString(),
      actorId: notif.actorId._id.toString(),
      actorName: notif.actorId.username,
      actorAvatar: notif.actorId.avatar,
      type: notif.type,
      postId: notif.postId?.toString(),
      commentId: notif.commentId?.toString(),
      content: notif.content,
      read: notif.read,
      actionType: notif.actionType,
      createdAt: notif.createdAt.toISOString(),
      isVerified: notif.actorId.isVerified,
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(notificationId, { read: true }, { new: true })
      .exec();
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipientId: userId, read: false },
      { read: true },
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: userId,
      read: false,
    });
  }

  async notifyPostLike(postAuthorId: string, actorId: string, postId: string): Promise<void> {
    // Check if already notified about this user liking this post in the last 24 hours
    const existingNotif = await this.notificationModel.findOne({
      recipientId: postAuthorId,
      actorId: actorId,
      type: NotificationType.LIKE,
      postId: postId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (!existingNotif) {
      await this.createNotification({
        recipientId: postAuthorId,
        actorId: actorId,
        type: NotificationType.LIKE,
        postId: postId,
        actionType: 'post',
      });
    }
  }

  async notifyCommentOnPost(postAuthorId: string, commentorId: string, postId: string, commentContent: string): Promise<void> {
    try {
      await this.createNotification({
        recipientId: postAuthorId,
        actorId: commentorId,
        type: NotificationType.COMMENT,
        postId: postId,
        content: commentContent,
        actionType: 'post',
      });
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  async notifyReplyOnComment(commentAuthorId: string, replyerId: string, postId: string, commentId: string, replyContent: string): Promise<void> {
    try {
      await this.createNotification({
        recipientId: commentAuthorId,
        actorId: replyerId,
        type: NotificationType.REPLY,
        postId: postId,
        commentId: commentId,
        content: replyContent,
        actionType: 'reply',
      });
    } catch (error) {
      console.error('Error creating reply notification:', error);
    }
  }

  async notifyPostRepost(postAuthorId: string, actorId: string, postId: string): Promise<void> {
    const existingNotif = await this.notificationModel.findOne({
      recipientId: postAuthorId,
      actorId: actorId,
      type: NotificationType.REPOST,
      postId: postId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (!existingNotif) {
      await this.createNotification({
        recipientId: postAuthorId,
        actorId: actorId,
        type: NotificationType.REPOST,
        postId: postId,
        actionType: 'post',
      });
    }
  }

  async notifyPostSave(postAuthorId: string, actorId: string, postId: string): Promise<void> {
    // Note: You might not want to notify on saves, but including it for completeness
    // You can remove this if not needed
  }
}
