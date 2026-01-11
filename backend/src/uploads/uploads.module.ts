import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [ConfigModule, MulterModule.register({})],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
