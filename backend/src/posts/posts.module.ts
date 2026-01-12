import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';
import { WatchEvent, WatchEventSchema } from './schemas/watch-event.schema';
import { WatchEventsService } from './watch-events.service';
import { UploadsModule } from '../uploads/uploads.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: WatchEvent.name, schema: WatchEventSchema },
    ]),
    UploadsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, WatchEventsService],
  exports: [PostsService],
})
export class PostsModule {}
