import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true })
  reportedId: string; // ID of reported user or post

  @Prop({ required: true })
  reportedType: 'user' | 'post'; // What is being reported

  @Prop({ required: true })
  reporterId: string; // User who submitted the report

  @Prop({
    enum: [
      'spam',
      'harassment',
      'hate_speech',
      'inappropriate_content',
      'misinformation',
      'copyright',
      'other',
    ],
    required: true,
  })
  reason: string;

  @Prop()
  description?: string; // Additional context

  @Prop({ enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' })
  status: string;

  @Prop()
  adminNotes?: string;

  @Prop({ default: false })
  isBanned: boolean; // Whether reported user/post was banned

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ reportedId: 1, reportedType: 1 });
ReportSchema.index({ reporterId: 1, createdAt: -1 });
ReportSchema.index({ status: 1 });
