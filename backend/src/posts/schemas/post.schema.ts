import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

export type MediaType = 'image' | 'video' | 'reel' | 'none';
export type PostType = 'post' | 'reel';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ enum: ['image', 'video', 'reel', 'none'], default: 'none' })
  mediaType: MediaType;

  @Prop()
  media?: string; // Cloudinary URL

  @Prop()
  mediaPublicId?: string; // Cloudinary public ID for deletion

  @Prop({ enum: ['post', 'reel'], default: 'post' })
  type: PostType;

  @Prop({ type: [String], default: [] })
  likes: string[]; // Array of user IDs who liked this post

  @Prop({ type: [String], default: [] })
  saves: string[]; // Array of user IDs who saved this post

  @Prop({ type: [String], default: [] })
  reposts: string[]; // Array of user IDs who reposted this post

  @Prop({
    type: [
      {
        id: String,
        userId: String,
        text: String,
        likes: [String],
        replies: Array,
        createdAt: Date,
      },
    ],
    default: [],
  })
  comments: Array<{
    id: string
    userId: string
    text: string
    likes: string[]
    replies: Array<{
      id: string
      userId: string
      text: string
      likes: string[]
      createdAt: Date
    }>
    createdAt: Date
  }>; // Nested comments with replies

  @Prop({ type: Number, default: 0 })
  commentCount: number;

  @Prop()
  videoDuration?: number; // Duration in seconds for videos/reels

  @Prop({ type: Number, default: 0 })
  impressions: number; // Total number of views/impressions

  @Prop({ type: [String], default: [] })
  viewers: string[]; // Array of user IDs who have viewed this post

  @Prop({ type: Number, default: 0 })
  avgWatchTime?: number; // Average watch time in seconds (for reels/videos)

  @Prop({ type: Number, default: 0 })
  completionRate?: number; // Completion rate for reels/videos (0-1)

  @Prop({ type: Number, default: 0 })
  replayCount?: number; // Number of replays/rewatches

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ authorId: 1, createdAt: -1 });
