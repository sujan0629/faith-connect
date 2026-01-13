import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateVideoPostDto } from './dto/create-video-post.dto';
import { CreateReelDto } from './dto/create-reel.dto';
import { UploadsService } from '../uploads/uploads.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WatchEventsService } from './watch-events.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private uploadsService: UploadsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private watchEventsService?: WatchEventsService,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto): Promise<PostDocument> {
    if (!authorId) {
      throw new BadRequestException('Author ID is required');
    }

    const post = new this.postModel({
      authorId,
      title: dto.title,
      body: dto.body,
      mediaType: dto.image ? 'image' : 'none',
      media: dto.image || undefined,
      mediaPublicId: dto.imagePublicId || undefined,
      type: 'post',
      likes: [],
      saves: [],
      commentCount: 0,
    });

    return post.save();
  }

  async createVideoPost(authorId: string, dto: CreateVideoPostDto): Promise<PostDocument> {
    if (!authorId) {
      throw new BadRequestException('Author ID is required');
    }

    // Validate that video is longer than 60 seconds
    if (dto.duration <= 60) {
      throw new BadRequestException(
        'Video must be longer than 60 seconds for a video post. Use reel endpoint for shorter videos.',
      );
    }

    const post = new this.postModel({
      authorId,
      title: dto.title,
      body: dto.body,
      mediaType: 'video',
      media: dto.video,
      mediaPublicId: dto.videoPublicId,
      type: 'post',
      videoDuration: dto.duration,
      likes: [],
      saves: [],
      commentCount: 0,
    });

    return post.save();
  }

  async createReel(authorId: string, dto: CreateReelDto): Promise<PostDocument> {
    if (!authorId) {
      throw new BadRequestException('Author ID is required');
    }

    // Validate that video is 60 seconds or less
    if (dto.duration > 60) {
      throw new BadRequestException(
        'Reel must be 60 seconds or less. Use video post endpoint for longer videos.',
      );
    }

    const post = new this.postModel({
      authorId,
      title: dto.title,
      body: dto.body,
      mediaType: 'reel',
      media: dto.video,
      mediaPublicId: dto.videoPublicId,
      type: 'reel',
      videoDuration: dto.duration,
      likes: [],
      saves: [],
      commentCount: 0,
    });

    return post.save();
  }

  async getPostById(postId: string): Promise<PostDocument | null> {
    return this.postModel.findById(postId).exec();
  }

  async getPostsByAuthorId(authorId: string): Promise<PostDocument[]> {
    return this.postModel.find({ authorId, isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async getFeedPosts(limit = 20, skip = 0): Promise<PostDocument[]> {
    return this.postModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getReels(limit = 20, skip = 0): Promise<PostDocument[]> {
    return this.postModel
      .find({ type: 'reel', isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getFollowingPosts(userId: string, limit = 20, skip = 0): Promise<PostDocument[]> {
    // Get the user's following list first
    const user = await this.usersService.findById(userId);
    if (!user?.following) {
      return [];
    }

    // Query posts from users they follow
    return this.postModel
      .find({ authorId: { $in: user.following }, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Search posts by title, body, or author name
   */
  async searchPosts(
    query: string,
    type: 'post' | 'reel' = 'post',
    limit = 20,
    skip = 0,
  ): Promise<PostDocument[]> {
    const searchQuery = {
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } },
      ],
    };

    // Add type filter if specified
    if (type === 'reel') {
      (searchQuery as any).type = 'reel';
    } else if (type === 'post') {
      (searchQuery as any).type = { $in: ['post'] };
    }

    return this.postModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getSavedPosts(userId: string, limit = 20, skip = 0): Promise<PostDocument[]> {
    return this.postModel
      .find({ saves: userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getRepostedPosts(userId: string, limit = 20, skip = 0): Promise<PostDocument[]> {
    return this.postModel
      .find({ reposts: userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async toggleLike(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
      // Notify post author about the like
      if (post.authorId !== userId) {
        const author = await this.usersService.findById(userId);
        this.notificationsService.notifyPostLike(post.authorId, userId, postId, author?.username || 'User').catch(err => console.error('Notification error:', err));
      }
    }

    return post.save();
  }

  async toggleSave(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const saveIndex = post.saves.indexOf(userId);
    if (saveIndex > -1) {
      post.saves.splice(saveIndex, 1);
    } else {
      post.saves.push(userId);
    }

    return post.save();
  }

  async toggleRepost(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const repostIndex = post.reposts.indexOf(userId);
    if (repostIndex > -1) {
      post.reposts.splice(repostIndex, 1);
    } else {
      post.reposts.push(userId);
      // Notify post author about the repost
      if (post.authorId !== userId) {
        const author = await this.usersService.findById(userId);
        this.notificationsService.notifyPostRepost(post.authorId, userId, postId, author?.username || 'User').catch(err => console.error('Notification error:', err));
      }
    }

    return post.save();
  }

  async addComment(postId: string, userId: string, text: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const commentId = Date.now().toString();
    post.comments.push({
      id: commentId,
      userId,
      text,
      likes: [],
      replies: [],
      createdAt: new Date(),
    });
    post.commentCount = post.comments.length;

    // Notify post author about the comment
    if (post.authorId !== userId) {
      const author = await this.usersService.findById(userId);
      this.notificationsService.notifyCommentOnPost(post.authorId, userId, postId, text, author?.username || 'User').catch(err => console.error('Notification error:', err));
    }

    return post.save();
  }

  async addReplyToComment(
    postId: string,
    commentId: string,
    userId: string,
    text: string,
  ): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const replyId = Date.now().toString();
    comment.replies.push({
      id: replyId,
      userId,
      text,
      likes: [],
      createdAt: new Date(),
    });

    // Notify comment author about the reply (if not replying to themselves)
    if (comment.userId !== userId) {
      const author = await this.usersService.findById(userId);
      this.notificationsService.notifyReplyOnComment(comment.userId, userId, postId, commentId, text, author?.username || 'User').catch(err => console.error('Notification error:', err));
    }

    return post.save();
  }

  async toggleCommentLike(postId: string, commentId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    return post.save();
  }

  async toggleReplyLike(
    postId: string,
    commentId: string,
    replyId: string,
    userId: string,
  ): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const reply = comment.replies.find((r) => r.id === replyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    const likeIndex = reply.likes.indexOf(userId);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(userId);
    }

    return post.save();
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.findByIdAndDelete(postId).exec();
  }

  async formatPostResponse(post: PostDocument, currentUserId?: string) {
    // Fetch author data
    const author = await this.usersService.findPublicById(post.authorId);
    
    return {
      id: post._id?.toString(),
      authorId: post.authorId,
      authorName: author?.name || 'Anonymous',
      authorAvatar: author?.avatar,
      faith: author?.faith || author?.denomination || 'unknown',
      title: post.title,
      body: post.body,
      mediaType: post.mediaType,
      media: post.media,
      type: post.type,
      likes: post.likes.length,
      isLiked: currentUserId ? post.likes.includes(currentUserId) : false,
      saves: post.saves.length,
      isSaved: currentUserId ? post.saves.includes(currentUserId) : false,
      reposts: post.reposts.length,
      isReposted: currentUserId ? post.reposts.includes(currentUserId) : false,
      comments: post.commentCount,
      videoDuration: post.videoDuration,
      impressions: post.impressions || 0,
      avgWatchTime: post.avgWatchTime || 0,
      completionRate: post.completionRate || 0,
      replayCount: post.replayCount || 0,
      createdAt: post.createdAt || new Date(),
    };
  }

  /**
   * Track post impression when viewed
   * Increments impression counter and adds viewer to viewers array
   */
  async trackImpression(postId: string, userId?: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment impressions
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { impressions: 1 },
      ...(userId && !post.viewers.includes(userId) && { $addToSet: { viewers: userId } }),
    });
  }

  /**
   * Batch track impressions for performance
   */
  async batchTrackImpressions(impressions: Array<{ postId: string; userId?: string }>): Promise<void> {
    for (const imp of impressions) {
      await this.trackImpression(imp.postId, imp.userId);
    }
  }
}
