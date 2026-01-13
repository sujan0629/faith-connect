import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { Role } from '@faithconnect/shared';

export type UserDocument = HydratedDocument<User>;
export { Role };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  username?: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ enum: ['worshiper', 'leader'], default: 'worshiper' })
  role: Role;

  @Prop({ enum: ['active', 'pending'], default: 'pending' })
  status: 'active' | 'pending';

  @Prop()
  passwordHash?: string;

  @Prop()
  magicTokenHash?: string;

  @Prop()
  magicTokenExpiresAt?: Date;

  @Prop()
  signupCodeHash?: string;

  @Prop()
  signupCodeExpiresAt?: Date;

  @Prop()
  signupCodeVerifiedAt?: Date;

  @Prop()
  refreshTokenHash?: string;

  @Prop({ default: false })
  hasProfile: boolean;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  @Prop()
  faith?: string;

  @Prop()
  bio?: string;

  @Prop()
  avatar?: string;

  @Prop()
  denomination?: string;

  @Prop({ type: [String], default: [] })
  contentFocus?: string[];

  @Prop({ type: [String], default: [] })
  audiencePrefs?: string[];

  @Prop({ type: [String], default: [] })
  following?: string[]; // Array of leader IDs this user follows

  @Prop({ type: [String], default: [] })
  followers?: string[]; // Array of user IDs following this user (for leaders)

  @Prop({ type: [String], default: [] })
  blockedUsers?: string[]; // Array of user IDs blocked by this user

  @Prop({ type: [String], default: [] })
  blockedBy?: string[]; // Array of user IDs who blocked this user

  // Settings & Preferences
  @Prop({ default: true })
  notificationsEnabled?: boolean;

  @Prop({ default: true })
  emailNotificationsEnabled?: boolean;

  @Prop({ default: true })
  allowMessagesFromAnyone?: boolean;

  @Prop({ default: false })
  privateProfile?: boolean;

  @Prop({ default: true })
  allowComments?: boolean;

  @Prop({ enum: ['everyone', 'followers', 'none'], default: 'everyone' })
  whoCanLike?: string;

  @Prop({ type: [String], default: [] })
  blockedContentTopics?: string[]; // Topics to filter out from feed

  // Push Notification Token
  @Prop({ type: [String], default: [] })
  pushNotificationTokens?: string[]; // Array of expo push notification tokens
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
