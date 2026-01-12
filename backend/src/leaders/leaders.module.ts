import { Module } from '@nestjs/common';
import { LeadersController } from './leaders.controller';
import { LeadersService } from './leaders.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [LeadersController],
  providers: [LeadersService],
  exports: [LeadersService],
})
export class LeadersModule {}