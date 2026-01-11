import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { Express } from 'express';

@Injectable()
export class UploadsService {
  private cloudinaryEnabled: boolean;
  private uploadPreset: string | null;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    this.uploadPreset = this.configService.get<string>('CLOUDINARY_UPLOAD_PRESET') || null;

    this.cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

    if (this.cloudinaryEnabled) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn('Cloudinary credentials missing. Upload endpoints will not persist files.');
    }
  }

  async uploadBuffer(file: Express.Multer.File, folder = 'faithconnect') {
    if (!this.cloudinaryEnabled) {
      throw new InternalServerErrorException('Cloudinary is not configured');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const options: Record<string, any> = { folder, resource_type: 'auto' };
      if (this.uploadPreset) {
        options.upload_preset = this.uploadPreset;
      }

      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new InternalServerErrorException('Upload failed'));
          resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }
}
