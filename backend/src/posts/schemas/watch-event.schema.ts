import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WatchEventDocument = HydratedDocument<WatchEvent>;

@Schema({ timestamps: true })
export class WatchEvent {
  @Prop({ required: true })
  postId: string; // Post or Reel ID

  @Prop({ required: true })
  userId: string; // User who watched

  @Prop({ required: true })
  watchTime: number; // Seconds watched

  @Prop({ required: true })
  duration: number; // Total video duration

  @Prop({ default: false })
  completed: boolean; // Whether user watched >= 95% of video

  @Prop({ default: false })
  replayed: boolean; // Whether this is a replay (subsequent watch)

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const WatchEventSchema = SchemaFactory.createForClass(WatchEvent);
WatchEventSchema.index({ postId: 1, createdAt: -1 });
WatchEventSchema.index({ userId: 1, postId: 1 });
WatchEventSchema.index({ postId: 1, completed: 1 });
