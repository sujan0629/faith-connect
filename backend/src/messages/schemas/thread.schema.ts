import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ThreadDocument = HydratedDocument<Thread>;

@Schema({ timestamps: true })
export class Thread {
  @Prop({ type: [Types.ObjectId], ref: User.name, required: true })
  participants: Types.ObjectId[];

  // Deterministic sorted key of participants to enforce uniqueness of a 2-person thread
  @Prop({ required: true, index: true, unique: true })
  pairKey: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  lastSender?: Types.ObjectId;

  @Prop()
  lastMessage?: string;

  // Map of userId -> unread count
  @Prop({ type: Map, of: Number, default: {} })
  unread?: Map<string, number>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
