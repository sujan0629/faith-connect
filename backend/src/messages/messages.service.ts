import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Thread, ThreadDocument } from './schemas/thread.schema';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Thread.name) private threadModel: Model<ThreadDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private usersService: UsersService,
  ) {}

  private buildPairKey(userA: string, userB: string) {
    return [userA, userB].sort().join(':');
  }

  private ensureNotSelf(userId: string, peerId: string) {
    if (userId === peerId) {
      throw new BadRequestException('Cannot create a thread with yourself');
    }
  }

  async getOrCreateThread(userId: string, peerId: string) {
    this.ensureNotSelf(userId, peerId);
    const pairKey = this.buildPairKey(userId, peerId);

    let thread = await this.threadModel.findOne({ pairKey }).exec();
    if (thread) return thread;

    const peer = await this.usersService.findById(peerId);
    if (!peer) throw new NotFoundException('Peer not found');

    thread = await this.threadModel.create({
      participants: [new Types.ObjectId(userId), new Types.ObjectId(peerId)],
      pairKey,
      unread: new Map<string, number>([
        [userId, 0],
        [peerId, 0],
      ]),
    });

    return thread;
  }

  async listThreads(user: UserDocument) {
    const threads = await this.threadModel
      .find({ participants: new Types.ObjectId(user.id) })
      .populate('participants', 'id name email username avatar role status')
      .sort({ updatedAt: -1 })
      .exec();

    return threads.map((thread) => {
      const peer = (thread.participants as any[]).find((p) => p.id !== user.id);
      const unread = thread.unread?.get(user.id) ?? 0;
      return {
        id: thread.id,
        peerId: peer?.id,
        peerName: peer?.name || peer?.username || peer?.email,
        avatar: peer?.avatar,
        lastMessage: thread.lastMessage ?? '',
        unread,
        isActive: peer?.status === 'active',
        timestamp: thread.updatedAt,
        peerRole: peer?.role,
      };
    });
  }

  private async assertParticipant(threadId: string, userId: string) {
    const thread = await this.threadModel.findById(threadId).exec();
    if (!thread) throw new NotFoundException('Thread not found');
    const isParticipant = thread.participants.some((p) => p.toString() === userId);
    if (!isParticipant) throw new ForbiddenException('You are not a participant of this thread');
    return thread;
  }

  async listMessages(threadId: string, user: UserDocument) {
    const thread = await this.assertParticipant(threadId, user.id);

    // Mark as read for current user
    if (thread.unread) {
      thread.unread.set(user.id, 0);
      await thread.save();
    }

    const items = await this.messageModel
      .find({ thread: new Types.ObjectId(threadId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'id name username')
      .exec();

    return items.map((m) => ({
      id: m.id,
      threadId,
      senderId: m.sender instanceof Types.ObjectId ? m.sender.toString() : (m.sender as any)?.id,
      senderName:
        m.sender instanceof Types.ObjectId
          ? undefined
          : (m.sender as any)?.name || (m.sender as any)?.username,
      content: m.content,
      createdAt: m.createdAt,
      isMine: (m.sender instanceof Types.ObjectId ? m.sender.toString() : (m.sender as any)?.id) === user.id,
    }));
  }

  async sendMessage(threadId: string, sender: UserDocument, content: string) {
    const thread = await this.assertParticipant(threadId, sender.id);

    const message = await this.messageModel.create({
      thread: thread._id,
      sender: sender._id,
      content,
    });

    // Update thread metadata + unread counters
    thread.lastMessage = content;
    thread.lastSender = sender._id;
    if (!thread.unread) thread.unread = new Map<string, number>();
    thread.participants.forEach((participantId) => {
      const id = participantId.toString();
      if (id === sender.id) {
        thread.unread!.set(id, 0);
      } else {
        const current = thread.unread!.get(id) ?? 0;
        thread.unread!.set(id, current + 1);
      }
    });
    await thread.save();

    return {
      id: message.id,
      threadId: thread.id,
      senderId: sender.id,
      senderName: sender.name,
      content: message.content,
      createdAt: message.createdAt,
      isMine: true,
    };
  }
}
