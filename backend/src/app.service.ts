import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHealth() {
    return { status: 'ok', service: 'faithconnect-backend' };
  }

  /**
   * Keep-Alive Task: Runs every 10 minutes
   * Keeps the Render backend warm and prevents hibernation
   * This ensures backend is always responsive even when no user requests
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  handleBackendKeepAlive() {
    const timestamp = new Date().toISOString();
    this.logger.log(`[Backend Keep-Alive] Ping at ${timestamp}`);
    // Just logging is enough to keep the process active
    // This prevents Render from hibernating the service
  }
}
