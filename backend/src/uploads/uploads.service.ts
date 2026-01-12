import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { Express } from 'express';
import { CompressionService } from './compression.service';

@Injectable()
export class UploadsService {
  private cloudinaryEnabled: boolean;
  private uploadPreset: string | null;

  constructor(
    private configService: ConfigService,
    private compressionService: CompressionService,
  ) {
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

    let bufferToUpload = file.buffer;
    let mimeType = file.mimetype;

    try {
      // Compress image if it's an image file
      if (file.mimetype.startsWith('image/')) {
        const maxSizeKB = this.getMaxImageSize(folder);
        console.log(
          `Compressing image for folder: ${folder}, max size: ${maxSizeKB}KB`,
        );

        const compression = await this.compressionService.compressImage(
          file.buffer,
          file.mimetype,
          maxSizeKB,
        );

        bufferToUpload = compression.buffer;
        mimeType = compression.mimeType;

        console.log(
          `Image compression: ${((compression.originalSize ?? compression.size) / 1024).toFixed(2)}KB → ${(compression.size / 1024).toFixed(2)}KB (${compression.compressed ? 'compressed' : 'unchanged'})`,
        );
      }

      // Video compression would be handled via uploadVideoBuffer for file-based videos
      // This method is for direct buffer uploads (usually images)

      return this.uploadToCloudinary(bufferToUpload, mimeType, folder);
    } catch (error) {
      console.error('Upload buffer error:', error);
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  /**
   * Upload video file from disk (supports compression)
   */
  async uploadVideoBuffer(
    filePath: string,
    folder = 'faithconnect',
  ): Promise<UploadApiResponse> {
    if (!this.cloudinaryEnabled) {
      throw new InternalServerErrorException('Cloudinary is not configured');
    }

    let filePathToUpload = filePath;

    try {
      // Determine max video size based on folder
      const maxSizeMB = this.getMaxVideoSize(folder);
      console.log(
        `Compressing video for folder: ${folder}, max size: ${maxSizeMB}MB`,
      );

      const compression = await this.compressionService.compressVideo(
        filePath,
        maxSizeMB,
      );

      // Create temp file from compressed buffer
      const tempPath = filePath + '.compressed.mp4';
      const fs = await import('fs-extra');
      await fs.writeFile(tempPath, compression.buffer);
      filePathToUpload = tempPath;

      console.log(
        `Video compression: ${((compression.originalSize ?? compression.size) / 1024 / 1024).toFixed(2)}MB → ${(compression.size / 1024 / 1024).toFixed(2)}MB (${compression.compressed ? 'compressed' : 'unchanged'})`,
      );

      const result = await this.uploadToCloudinaryFile(filePathToUpload, folder);

      // Clean up temp file
      const fs2 = await import('fs-extra');
      await fs2.remove(filePathToUpload);

      return result;
    } catch (error) {
      // Clean up temp file if it exists
      if (filePathToUpload !== filePath) {
        const fs = await import('fs-extra');
        await fs.remove(filePathToUpload).catch(() => {});
      }
      console.error('Upload video error:', error);
      throw new InternalServerErrorException(
        `Failed to upload video: ${error.message}`,
      );
    }
  }

  /**
   * Determine max image size based on folder type
   */
  private getMaxImageSize(folder: string): number {
    if (folder.includes('avatar') || folder.includes('profile')) {
      return 80; // Avatar/profile: 30-80 KB max
    }
    return 200; // Default post images: 100-200 KB max
  }

  /**
   * Determine max video size based on folder type
   */
  private getMaxVideoSize(folder: string): number {
    if (folder.includes('reel')) {
      return 8; // Reels: 3-6 MB, max 8 MB
    }
    // Long videos: 10-25 MB per minute, but cap at 100 MB for 5-min videos
    return 100;
  }

  /**
   * Upload buffer directly to Cloudinary
   */
  private uploadToCloudinary(
    buffer: Buffer,
    mimeType: string,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const options: Record<string, any> = { folder, resource_type: 'auto' };
      if (this.uploadPreset) {
        options.upload_preset = this.uploadPreset;
      }

      console.log('Uploading to Cloudinary with options:', {
        folder,
        hasPreset: Boolean(this.uploadPreset),
        uploadPreset: this.uploadPreset,
        bufferSize: buffer.length,
      });

      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', {
            message: error.message,
            http_code: error.http_code,
            status: error.status,
            error: error,
          });
          return reject(error);
        }
        if (!result) {
          console.error('Cloudinary upload returned no result');
          return reject(new InternalServerErrorException('Upload failed - no result from Cloudinary'));
        }
        console.log('Cloudinary upload successful:', { publicId: result.public_id, url: result.secure_url });
        resolve(result);
      });

      stream.on('error', (err) => {
        console.error('Stream error:', err);
      });

      stream.end(buffer);
    });
  }

  /**
   * Upload file from disk to Cloudinary
   */
  private uploadToCloudinaryFile(
    filePath: string,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const options: Record<string, any> = { folder, resource_type: 'auto' };
      if (this.uploadPreset) {
        options.upload_preset = this.uploadPreset;
      }

      cloudinary.uploader.upload(filePath, options, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new InternalServerErrorException('Upload failed'));
        resolve(result);
      });
    });
  }
}
