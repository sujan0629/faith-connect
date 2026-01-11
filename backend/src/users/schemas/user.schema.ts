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
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
