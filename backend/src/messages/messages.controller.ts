import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateThreadDto } from './dto/create-thread.dto';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('threads')
  async getThreads(@AuthUser() user: UserDocument) {
    return this.messagesService.listThreads(user);
  }

  @Post('threads')
  async createThread(@Body() dto: CreateThreadDto, @AuthUser() user: UserDocument) {
    const thread = await this.messagesService.getOrCreateThread(user.id, dto.peerId);
    return { id: thread.id };
  }

  @Get('threads/:threadId/messages')
  async getMessages(@Param('threadId') threadId: string, @AuthUser() user: UserDocument) {
    return this.messagesService.listMessages(threadId, user);
  }

  @Post('threads/:threadId/messages')
  async sendMessage(
    @Param('threadId') threadId: string,
    @Body() dto: SendMessageDto,
    @AuthUser() user: UserDocument,
  ) {
    return this.messagesService.sendMessage(threadId, user, dto.content);
  }
}
