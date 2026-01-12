import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsMongoId()
  recipientId: string;

  @IsMongoId()
  actorId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsMongoId()
  @IsOptional()
  postId?: string;

  @IsOptional()
  commentId?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  actionType?: 'post' | 'comment' | 'reply';
}

export class NotificationResponseDto {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  content?: string;
  read: boolean;
  actionType?: 'post' | 'comment' | 'reply';
  createdAt: string;
  isVerified?: boolean;
}
