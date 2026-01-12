import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface CompressionResult {
  buffer: Buffer;
  mimeType: string;
  size: number;
  originalSize?: number;
  compressed: boolean;
}

@Injectable()
export class CompressionService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp-uploads');
    fs.ensureDirSync(this.tempDir);
  }

  /**
   * Compress image to fit within specified size constraints
   * Post images: 100-200 KB (MAX 200 KB)
   * Avatars: 30-80 KB (MAX 80 KB)
   */
  async compressImage(
    buffer: Buffer,
    mimeType: string,
    maxSizeKB: number = 200,
  ): Promise<CompressionResult> {
    const originalSize = buffer.length;
    const maxSizeBytes = maxSizeKB * 1024;

    // If already small enough, return as-is
    if (originalSize <= maxSizeBytes) {
      return {
        buffer,
        mimeType,
        size: originalSize,
        originalSize,
        compressed: false,
      };
    }

    try {
      let compressed = buffer;
      let quality = 80;
      let isSmallEnough = false;

      // Iteratively compress until we hit the target size
      while (quality > 30 && !isSmallEnough) {
        compressed = await sharp(buffer)
          .resize(2048, 2048, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality, progressive: true })
          .toBuffer();

        if (compressed.length <= maxSizeBytes) {
          isSmallEnough = true;
        } else {
          quality -= 10;
        }
      }

      // Final attempt at lowest quality if still too large
      if (!isSmallEnough && quality <= 30) {
        compressed = await sharp(buffer)
          .resize(1024, 1024, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 20, progressive: true })
          .toBuffer();
      }

      return {
        buffer: compressed,
        mimeType: 'image/jpeg',
        size: compressed.length,
        originalSize,
        compressed: true,
      };
    } catch (error) {
      console.error('Image compression error:', error);
      throw new InternalServerErrorException(
        `Failed to compress image: ${error.message}`,
      );
    }
  }

  /**
   * Compress video to fit within specified size constraints
   * Reels (<60s): 3-6 MB (MAX 8 MB)
   * Long Videos: 10-25 MB per minute (5-min: 50-100 MB max)
   */
  async compressVideo(
    filePath: string,
    maxSizeMB: number = 8,
  ): Promise<CompressionResult> {
    const originalSize = await fs.stat(filePath).then(s => s.size);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // If already small enough, return as-is
    if (originalSize <= maxSizeBytes) {
      const buffer = await fs.readFile(filePath);
      return {
        buffer,
        mimeType: 'video/mp4',
        size: originalSize,
        originalSize,
        compressed: false,
      };
    }

    const outputPath = path.join(this.tempDir, `compressed-${uuidv4()}.mp4`);

    try {
      // Get video duration and dimensions
      const { duration, width, height } = await this.getVideoInfo(filePath);

      // Calculate target bitrate based on duration and max size
      const targetBitrateMbps = Math.floor(
        (maxSizeBytes * 8) / (duration * 1000000),
      );
      const minBitrate = Math.max(targetBitrateMbps, 500); // Min 500 kbps

      return new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .outputOptions([
            `-vb ${minBitrate}k`, // Video bitrate
            '-c:v libx264',
            '-preset medium',
            '-c:a aac',
            '-b:a 128k', // Audio bitrate
            `-s ${this.calculateResolution(width, height)}`, // Scale resolution
          ])
          .output(outputPath)
          .on('end', async () => {
            try {
              const compressedSize = await fs
                .stat(outputPath)
                .then(s => s.size);
              const buffer = await fs.readFile(outputPath);

              // Clean up temp file
              await fs.remove(outputPath);

              resolve({
                buffer,
                mimeType: 'video/mp4',
                size: compressedSize,
                originalSize,
                compressed: true,
              });
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (err) => {
            fs.removeSync(outputPath);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      // Clean up temp file if it exists
      if (await fs.pathExists(outputPath)) {
        await fs.remove(outputPath);
      }
      console.error('Video compression error:', error);
      throw new InternalServerErrorException(
        `Failed to compress video: ${error.message}`,
      );
    }
  }

  /**
   * Get video duration and dimensions
   */
  private getVideoInfo(filePath: string): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);

        const stream = metadata.streams.find(s => s.codec_type === 'video');
        if (!stream) return reject(new Error('No video stream found'));

        resolve({
          duration: metadata.format.duration || 0,
          width: stream.width || 1920,
          height: stream.height || 1080,
        });
      });
    });
  }

  /**
   * Calculate appropriate resolution based on original dimensions
   */
  private calculateResolution(width: number, height: number): string {
    // For reels/short videos, keep higher resolution
    // For long videos, reduce more aggressively
    const maxDimension = Math.max(width, height);

    if (maxDimension <= 720) {
      return '720x480';
    } else if (maxDimension <= 1080) {
      return '1080x720';
    } else {
      return '1280x720';
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        await fs.remove(filePath);
      }
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }

  /**
   * Remove a specific temporary file
   */
  async removeTempFile(filePath: string): Promise<void> {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    } catch (error) {
      console.warn('Failed to remove temp file:', filePath, error);
    }
  }
}
