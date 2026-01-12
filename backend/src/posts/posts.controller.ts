import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { IsLeaderGuard } from './guards/is-leader.guard';
import { PostsService } from './posts.service';
import { WatchEventsService } from './watch-events.service';
import { UploadsService } from '../uploads/uploads.service';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';
import { CreatePostDtoSchema } from './dto/create-post.dto';
import { CreateVideoPostDtoSchema } from './dto/create-video-post.dto';
import { CreateReelDtoSchema } from './dto/create-reel.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private watchEventsService: WatchEventsService,
    private uploadsService: UploadsService,
    private usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(IsLeaderGuard)
  @UseInterceptors(FileInterceptor('image', { storage: multer.memoryStorage() }))
  async createPost(
    @AuthUser() user: UserDocument,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Parse the body
      const parsedBody = {
        title: body.title,
        body: body.body,
        image: body.image,
        imagePublicId: body.imagePublicId,
      };

      // Validate with Zod
      const dto = CreatePostDtoSchema.parse(parsedBody);

      const post = await this.postsService.createPost(user.id, dto);
      return await this.postsService.formatPostResponse(post, user.id);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }

  @Post('video')
  @UseGuards(IsLeaderGuard)
  async createVideoPost(
    @AuthUser() user: UserDocument,
    @Body() body: any,
  ) {
    try {
      // Validate with Zod
      const dto = CreateVideoPostDtoSchema.parse({
        title: body.title,
        body: body.body,
        video: body.video,
        videoPublicId: body.videoPublicId,
        duration: parseFloat(body.duration),
      });

      const post = await this.postsService.createVideoPost(user.id, dto);
      return await this.postsService.formatPostResponse(post, user.id);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }

  @Post('reel')
  @UseGuards(IsLeaderGuard)
  async createReel(
    @AuthUser() user: UserDocument,
    @Body() body: any,
  ) {
    try {
      // Validate with Zod
      const dto = CreateReelDtoSchema.parse({
        title: body.title,
        body: body.body,
        video: body.video,
        videoPublicId: body.videoPublicId,
        duration: parseFloat(body.duration),
      });

      const post = await this.postsService.createReel(user.id, dto);
      return await this.postsService.formatPostResponse(post, user.id);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }

  @Get('search')
  async searchPosts(
    @Query('q') query: string,
    @Query('type') type: 'post' | 'reel' = 'post',
    @Query('limit') limit = 20,
    @Query('skip') skip = 0,
    @AuthUser() user: UserDocument,
  ) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const posts = await this.postsService.searchPosts(query, type, limit, skip);
    return Promise.all(posts.map((post) => this.postsService.formatPostResponse(post, user?.id)));
  }

  @Get()
  async getFeed(@Query('limit') limit = 20, @Query('skip') skip = 0, @AuthUser() user: UserDocument) {
    const posts = await this.postsService.getFeedPosts(limit, skip);
    return Promise.all(posts.map((post) => this.postsService.formatPostResponse(post, user?.id)));
  }

  @Get('saved')
  async getSavedPosts(@Query('limit') limit = '20', @Query('skip') skip = '0', @AuthUser() user: UserDocument) {
    const posts = await this.postsService.getSavedPosts(user.id, parseInt(limit), parseInt(skip));
    return Promise.all(posts.map((post) => this.postsService.formatPostResponse(post, user?.id)));
  }

  @Get('reposts')
  async getRepostedPosts(
    @Query('limit') limit = '20',
    @Query('skip') skip = '0',
    @Query('userId') userId?: string,
    @AuthUser() user?: UserDocument
  ) {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      throw new Error('User ID is required');
    }
    const posts = await this.postsService.getRepostedPosts(targetUserId as string, parseInt(limit), parseInt(skip));
    return Promise.all(posts.map((post) => this.postsService.formatPostResponse(post, user?.id)));
  }

  @Get('reels')
  async getReels(@Query('limit') limit = 20, @Query('skip') skip = 0, @AuthUser() user: UserDocument) {
    const reels = await this.postsService.getReels(limit, skip);
    return Promise.all(reels.map((reel) => this.postsService.formatPostResponse(reel, user?.id)));
  }

  @Get('following')
  async getFollowingPosts(@Query('limit') limit = 20, @Query('skip') skip = 0, @AuthUser() user: UserDocument) {
    if (!user?.id) {
      throw new Error('User ID is required');
    }
    const posts = await this.postsService.getFollowingPosts(user.id, limit, skip);
    return Promise.all(posts.map((post) => this.postsService.formatPostResponse(post, user?.id)));
  }

  @Get('author/:authorId')
  async getAuthorPosts(
    @Param('authorId') authorId: string,
    @AuthUser() user: UserDocument,
  ) {
    const posts = await this.postsService.getPostsByAuthorId(authorId);
    return Promise.all(posts.map((post) => this.postsService.formatPostResponse(post, user?.id)));
  }

  @Get(':postId')
  async getPost(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Get(':postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    
    // Fetch user info for each comment and return
    const commentsWithUserInfo = await Promise.all(
      (post.comments || []).map(async (comment) => {
        const author = await this.usersService.findPublicById(comment.userId);
        
        // Fetch user info for each reply
        const repliesWithUserInfo = await Promise.all(
          (comment.replies || []).map(async (reply) => {
            const replyAuthor = await this.usersService.findPublicById(reply.userId);
            return {
              id: reply.id,
              authorId: reply.userId,
              authorName: replyAuthor?.name || 'Anonymous',
              authorAvatar: replyAuthor?.avatar,
              text: reply.text,
              likes: reply.likes?.length || 0,
              isLiked: user ? reply.likes?.includes(user.id) : false,
              replies: 0,
              repliesData: [],
              createdAt: reply.createdAt,
            };
          }),
        );
        
        return {
          id: comment.id,
          authorId: comment.userId,
          authorName: author?.name || 'Anonymous',
          authorAvatar: author?.avatar,
          text: comment.text,
          likes: comment.likes?.length || 0,
          isLiked: user ? comment.likes?.includes(user.id) : false,
          replies: comment.replies?.length || 0,
          repliesData: repliesWithUserInfo,
          createdAt: comment.createdAt,
        };
      }),
    );
    
    return commentsWithUserInfo;
  }

  @Post(':postId/like')
  async toggleLike(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.toggleLike(postId, user.id);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Post(':postId/save')
  async toggleSave(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.toggleSave(postId, user.id);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Post(':postId/repost')
  async toggleRepost(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.toggleRepost(postId, user.id);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Post(':postId/comment')
  async addComment(
    @Param('postId') postId: string,
    @Body('text') text: string,
    @AuthUser() user: UserDocument,
  ) {
    if (!text || text.trim() === '') {
      throw new BadRequestException('Comment text is required');
    }
    const post = await this.postsService.addComment(postId, user.id, text);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Post(':postId/comment/:commentId/reply')
  async addReplyToComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body('text') text: string,
    @AuthUser() user: UserDocument,
  ) {
    if (!text || text.trim() === '') {
      throw new BadRequestException('Reply text is required');
    }
    const post = await this.postsService.addReplyToComment(postId, commentId, user.id, text);
    if (!post) {
      throw new BadRequestException('Post or comment not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Post(':postId/comment/:commentId/like')
  async toggleCommentLike(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.toggleCommentLike(postId, commentId, user.id);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Post(':postId/comment/:commentId/reply/:replyId/like')
  async toggleReplyLike(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @AuthUser() user: UserDocument,
  ) {
    const post = await this.postsService.toggleReplyLike(postId, commentId, replyId, user.id);
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return this.postsService.formatPostResponse(post, user?.id);
  }

  @Delete(':postId')
  @UseGuards(IsLeaderGuard)
  async deletePost(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    await this.postsService.deletePost(postId, user.id);
    return { message: 'Post deleted' };
  }

  // ===== WATCH TRACKING ENDPOINTS =====

  /**
   * Track watch event for a reel/video
   * Records when user watches a video and for how long
   */
  @Post(':postId/watch')
  async trackWatch(
    @Param('postId') postId: string,
    @Body() body: { watchTime: number; duration: number },
    @AuthUser() user: UserDocument,
  ) {
    const watchEvent = await this.watchEventsService.trackWatchEvent(
      postId,
      user.id,
      body.watchTime,
      body.duration,
    );
    return watchEvent;
  }

  /**
   * Track impression when post is viewed
   */
  @Post(':postId/impression')
  async trackImpression(
    @Param('postId') postId: string,
    @AuthUser() user: UserDocument,
  ) {
    await this.postsService.trackImpression(postId, user.id);
    return { message: 'Impression tracked' };
  }

  /**
   * Batch track impressions
   */
  @Post('batch/impressions')
  async batchTrackImpressions(
    @Body() body: { impressions: Array<{ postId: string; userId?: string }> },
  ) {
    await this.postsService.batchTrackImpressions(body.impressions);
    return { message: 'Impressions tracked', count: body.impressions.length };
  }

  /**
   * Get metrics for a post
   */
  @Get(':postId/metrics')
  async getPostMetrics(@Param('postId') postId: string) {
    const metrics = await this.watchEventsService.getPostMetrics(postId);
    return metrics;
  }

  /**
   * Get trending reels
   */
  @Get('trending/reels')
  async getTrendingReels(
    @Query('limit') limit = 20,
    @Query('hours') hours = 24,
  ) {
    const reels = await this.watchEventsService.getTrendingReels(limit, hours);
    return Promise.all(reels.map((reel) => this.postsService.formatPostResponse(reel)));
  }
}
