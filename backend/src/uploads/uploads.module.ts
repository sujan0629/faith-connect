import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { CompressionService } from './compression.service';

@Module({
  imports: [ConfigModule, MulterModule.register({})],
  controllers: [UploadsController],
  providers: [UploadsService, CompressionService],
  exports: [UploadsService],
})
export class UploadsModule {}
