import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WatchEvent, WatchEventDocument } from './schemas/watch-event.schema';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class WatchEventsService {
  constructor(
    @InjectModel(WatchEvent.name) private watchEventModel: Model<WatchEventDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  /**
   * Track a watch event when user views a reel/video
   * Updates post metrics (impressions, avgWatchTime, completionRate)
   */
  async trackWatchEvent(
    postId: string,
    userId: string,
    watchTime: number,
    duration: number,
  ): Promise<WatchEvent> {
    if (watchTime < 0 || duration <= 0) {
      throw new BadRequestException('Invalid watch time or duration');
    }

    // Check if post exists
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if this is a replay (user already watched this post)
    const existingWatch = await this.watchEventModel.findOne({
      postId,
      userId,
    });

    const isCompleted = watchTime / duration >= 0.95; // 95% threshold
    const isReplayed = !!existingWatch;

    const watchEvent = new this.watchEventModel({
      postId,
      userId,
      watchTime,
      duration,
      completed: isCompleted,
      replayed: isReplayed,
    });

    await watchEvent.save();

    // Update post metrics
    await this.updatePostMetrics(postId);

    return watchEvent;
  }

  /**
   * Get watch events for a specific post
   */
  async getWatchEvents(postId: string, limit = 100, skip = 0): Promise<WatchEvent[]> {
    return this.watchEventModel
      .find({ postId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get watch metrics for a post
   */
  async getPostMetrics(
    postId: string,
  ): Promise<{
    impressions: number;
    uniqueViewers: number;
    avgWatchTime: number;
    completionRate: number;
    replayCount: number;
  }> {
    const events = await this.watchEventModel.find({ postId }).exec();

    const uniqueViewers = new Set(events.map((e) => e.userId)).size;
    const completedEvents = events.filter((e) => e.completed);
    const replayCount = events.filter((e) => e.replayed).length;

    const avgWatchTime =
      events.length > 0
        ? events.reduce((sum, e) => sum + e.watchTime, 0) / events.length
        : 0;

    const completionRate = events.length > 0 ? completedEvents.length / events.length : 0;

    return {
      impressions: events.length,
      uniqueViewers,
      avgWatchTime,
      completionRate,
      replayCount,
    };
  }

  /**
   * Update post metrics based on watch events
   * Called after each watch event to keep metrics fresh
   */
  async updatePostMetrics(postId: string): Promise<void> {
    const metrics = await this.getPostMetrics(postId);

    await this.postModel.findByIdAndUpdate(postId, {
      impressions: metrics.impressions,
      avgWatchTime: Math.round(metrics.avgWatchTime),
      completionRate: parseFloat(metrics.completionRate.toFixed(2)),
      replayCount: metrics.replayCount,
      viewers: (await this.watchEventModel.distinct('userId', { postId })) as string[],
    });
  }

  /**
   * Get trending reels based on engagement velocity
   * Score = (completionRate * 0.5 + avgWatchTime / duration * 0.3 + replayCount * 0.2)
   */
  async getTrendingReels(limit = 20, hours = 24): Promise<PostDocument[]> {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const reels = await this.postModel
      .find({
        type: 'reel',
        mediaType: 'reel',
        isActive: true,
        createdAt: { $gte: timeThreshold },
      })
      .sort({
        completionRate: -1,
        avgWatchTime: -1,
        replayCount: -1,
      })
      .limit(limit)
      .exec();

    return reels;
  }

  /**
   * Batch track watch events (for performance)
   */
  async batchTrackWatchEvents(
    events: Array<{
      postId: string;
      userId: string;
      watchTime: number;
      duration: number;
    }>,
  ): Promise<WatchEvent[]> {
    const results: WatchEvent[] = [];

    for (const event of events) {
      const watchEvent = await this.trackWatchEvent(
        event.postId,
        event.userId,
        event.watchTime,
        event.duration,
      );
      results.push(watchEvent);
    }

    return results;
  }
}
