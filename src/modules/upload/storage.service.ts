import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    this.bucketName = this.configService.get('AWS_S3_BUCKET', 'karte-audio-bucket');

    if (this.isProduction) {
      this.s3Client = new S3Client({
        region: this.configService.get('AWS_REGION', 'ap-southeast-1'),
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        },
      });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'audio',
    customFileName?: string,
  ): Promise<UploadResult> {
    const fileExtension = path.extname(file.originalname);
    const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    this.logger.log(`Uploading file: ${key} (${file.size} bytes)`);

    if (this.isProduction) {
      return this.uploadToS3(file, key);
    } else {
      return this.uploadToLocal(file, key);
    }
  }

  private async uploadToS3(file: Express.Multer.File, key: string): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded to S3: ${url}`);

      return {
        url,
        key,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('S3 upload failed:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  private async uploadToLocal(file: Express.Multer.File, key: string): Promise<UploadResult> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, key);
      const fileDir = path.dirname(filePath);

      // Ensure directory exists
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      const url = `/uploads/${key}`;

      this.logger.log(`File uploaded locally: ${url}`);

      return {
        url,
        key,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Local upload failed:', error);
      throw new Error('Failed to upload file locally');
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isProduction) {
      // For local development, return the direct URL
      return `/uploads/${key}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      this.logger.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isProduction) {
      // For local development, delete from filesystem
      const filePath = path.join(process.cwd(), 'uploads', key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted locally: ${key}`);
      }
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  getFileUrl(key: string): string {
    if (!this.isProduction) {
      return `/uploads/${key}`;
    }

    return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }
}
