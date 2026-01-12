import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationResponseDto } from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req): Promise<NotificationResponseDto[]> {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.notificationsService.markNotificationAsRead(id);
    return { success: true };
  }

  @Patch('mark-all/read')
  async markAllAsRead(@Request() req): Promise<{ success: boolean }> {
    await this.notificationsService.markAllNotificationsAsRead(req.user.id);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.notificationsService.deleteNotification(id);
    return { success: true };
  }
}
