import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  REPLY = 'reply',
  MENTION = 'mention',
  REPOST = 'repost',
  SAVE = 'save',
  FOLLOW = 'follow',
}

@Schema({ timestamps: true })
export class Notification {
  _id?: Types.ObjectId;

  @Prop({ type: String, ref: 'User', required: true })
  recipientId: string;

  @Prop({ type: String, ref: 'User', required: true })
  actorId: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ type: String, ref: 'Post' })
  postId?: string;

  @Prop({ type: String })
  commentId?: string;

  @Prop()
  content?: string;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  actionType?: 'post' | 'comment' | 'reply';

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
