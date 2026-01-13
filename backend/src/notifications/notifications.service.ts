import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';
import { PushNotificationService } from './push-notification.service';

@Injectable()
export class NotificationsService {
  private logger = new Logger('NotificationsService');

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private pushNotificationService: PushNotificationService,
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

  async notifyPostLike(postAuthorId: string, actorId: string, postId: string, actorName: string): Promise<void> {
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

      // Send push notification
      try {
        await this.pushNotificationService.notifyPostLike(postAuthorId, actorName, postId);
      } catch (error) {
        this.logger.error('Error sending push notification for like:', error);
      }
    }
  }

  async notifyCommentOnPost(
    postAuthorId: string,
    commentorId: string,
    postId: string,
    commentContent: string,
    commentorName: string,
  ): Promise<void> {
    try {
      await this.createNotification({
        recipientId: postAuthorId,
        actorId: commentorId,
        type: NotificationType.COMMENT,
        postId: postId,
        content: commentContent,
        actionType: 'post',
      });

      // Send push notification
      try {
        await this.pushNotificationService.notifyPostComment(
          postAuthorId,
          commentorName,
          postId,
          commentContent,
        );
      } catch (error) {
        this.logger.error('Error sending push notification for comment:', error);
      }
    } catch (error) {
      this.logger.error('Error creating comment notification:', error);
    }
  }

  async notifyReplyOnComment(
    commentAuthorId: string,
    replyerId: string,
    postId: string,
    commentId: string,
    replyContent: string,
    replyerName: string,
  ): Promise<void> {
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

      // Send push notification
      try {
        await this.pushNotificationService.notifyCommentReply(
          commentAuthorId,
          replyerName,
          postId,
          commentId,
          replyContent,
        );
      } catch (error) {
        this.logger.error('Error sending push notification for reply:', error);
      }
    } catch (error) {
      this.logger.error('Error creating reply notification:', error);
    }
  }

  async notifyPostRepost(
    postAuthorId: string,
    actorId: string,
    postId: string,
    actorName: string,
  ): Promise<void> {
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

      // Send push notification
      try {
        await this.pushNotificationService.sendCustomNotification(
          postAuthorId,
          'Post Reposted',
          `${actorName} reposted your post`,
          { type: 'repost', postId, actorName },
        );
      } catch (error) {
        this.logger.error('Error sending push notification for repost:', error);
      }
    }
  }

  async notifyNewFollower(userId: string, followerId: string, followerName: string): Promise<void> {
    try {
      await this.createNotification({
        recipientId: userId,
        actorId: followerId,
        type: NotificationType.FOLLOW,
      });

      // Send push notification
      try {
        await this.pushNotificationService.notifyNewFollower(userId, followerName);
      } catch (error) {
        this.logger.error('Error sending push notification for follow:', error);
      }
    } catch (error) {
      this.logger.error('Error creating follow notification:', error);
    }
  }

  async notifyPostSave(postAuthorId: string, actorId: string, postId: string): Promise<void> {
    // Note: You might not want to notify on saves, but including it for completeness
    // You can remove this if not needed
  }
}
