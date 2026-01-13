import { Injectable, Logger } from '@nestjs/common';
import * as Expo from 'expo-server-sdk';
import { UsersService } from '../users/users.service';

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

@Injectable()
export class PushNotificationService {
  private expoClient: Expo.Expo;
  private logger = new Logger('PushNotificationService');

  constructor(private usersService: UsersService) {
    // Initialize Expo SDK
    this.expoClient = new Expo.Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
    });
  }

  /**
   * Send a push notification to a user
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    try {
      const tokens = await this.usersService.getPushTokens(userId);
      
      if (!tokens || tokens.length === 0) {
        this.logger.warn(`No push tokens found for user ${userId}`);
        return { sent: 0, failed: 0 };
      }

      return await this.sendToTokens(tokens, payload);
    } catch (error) {
      this.logger.error(`Error sending notification to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Send a push notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    let totalSent = 0;
    let totalFailed = 0;

    for (const userId of userIds) {
      const result = await this.sendToUser(userId, payload);
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    return { sent: totalSent, failed: totalFailed };
  }

  /**
   * Send a push notification to specific tokens
   */
  async sendToTokens(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    // Validate tokens
    const validTokens = tokens.filter(token => Expo.Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      this.logger.warn('No valid Expo push tokens provided');
      return { sent: 0, failed: 0 };
    }

    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default' as const,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      badge: payload.badge || 1,
      priority: 'high' as const,
    }));

    try {
      // Send notifications in batches
      const chunks = this.expoClient.chunkPushNotifications(messages);
      let sent = 0;
      let failed = 0;

      for (const chunk of chunks) {
        try {
          const receipts = await this.expoClient.sendPushNotificationsAsync(chunk);
          
          for (const receipt of receipts) {
            if (receipt.status === 'ok') {
              sent++;
            } else {
              failed++;
              this.logger.warn(
                `Failed to send notification: ${receipt.status} - ${receipt.message}`,
              );
            }
          }
        } catch (error) {
          this.logger.error('Error sending chunk of notifications:', error);
          failed += chunk.length;
        }
      }

      this.logger.log(`Push notifications sent: ${sent}, failed: ${failed}`);
      return { sent, failed };
    } catch (error) {
      this.logger.error('Error sending push notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification for post like
   */
  async notifyPostLike(
    userId: string,
    actorName: string,
    postId: string,
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToUser(userId, {
      title: `New Like`,
      body: `${actorName} liked your post`,
      data: {
        type: 'like',
        postId,
        actorName,
      },
    });
  }

  /**
   * Send notification for post comment
   */
  async notifyPostComment(
    userId: string,
    actorName: string,
    postId: string,
    commentPreview: string,
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToUser(userId, {
      title: `New Comment`,
      body: `${actorName} commented: ${commentPreview.substring(0, 50)}...`,
      data: {
        type: 'comment',
        postId,
        actorName,
      },
    });
  }

  /**
   * Send notification for reply to comment
   */
  async notifyCommentReply(
    userId: string,
    actorName: string,
    postId: string,
    commentId: string,
    replyPreview: string,
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToUser(userId, {
      title: `New Reply`,
      body: `${actorName} replied: ${replyPreview.substring(0, 50)}...`,
      data: {
        type: 'reply',
        postId,
        commentId,
        actorName,
      },
    });
  }

  /**
   * Send notification for new follower
   */
  async notifyNewFollower(
    userId: string,
    actorName: string,
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToUser(userId, {
      title: `New Follower`,
      body: `${actorName} followed you`,
      data: {
        type: 'follow',
        actorName,
      },
    });
  }

  /**
   * Send notification for message
   */
  async notifyNewMessage(
    userId: string,
    senderName: string,
    messagePreview: string,
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToUser(userId, {
      title: `Message from ${senderName}`,
      body: messagePreview.substring(0, 50),
      data: {
        type: 'message',
        senderName,
      },
      badge: 1,
    });
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToUser(userId, {
      title,
      body,
      data,
    });
  }
}
