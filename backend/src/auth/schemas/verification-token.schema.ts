import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationTokenDocument = VerificationToken & Document;

@Schema({
  collection: 'verification_tokens',
  timestamps: { createdAt: true, updatedAt: false },
})
export class VerificationToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ required: true })
  codeHash: string;

  @Prop({ required: true, default: Date.now, expires: 3600 })
  expiresAt: Date;

  @Prop({ required: false })
  userAgent?: string;
}

export const VerificationTokenSchema = SchemaFactory.createForClass(VerificationToken);

// Ensure TTL index on expiresAt (Mongo will clean up automatically)
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });