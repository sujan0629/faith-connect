import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModerationService } from './moderation.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Report, ReportSchema } from './schemas/report.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class CommonModule {}
