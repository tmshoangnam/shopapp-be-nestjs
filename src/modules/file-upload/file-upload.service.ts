import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, userId: string) {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `uploads/${userId}/${fileName}`;

    try {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
      });

      await this.s3Client.send(command);

      // Save file metadata to database
      const fileRecord = await this.prisma.file.create({
        data: {
          userId,
          originalName: file.originalname,
          fileName,
          mimeType: file.mimetype,
          size: file.size,
          s3Key,
          s3Bucket: this.bucketName,
          url: `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${s3Key}`,
        },
      });

      return fileRecord;
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new BadRequestException('Unauthorized to delete this file');
    }

    try {
      // Delete from S3
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: file.s3Key,
      });

      await this.s3Client.send(command);

      // Delete from database
      await this.prisma.file.delete({
        where: { id: fileId },
      });

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(fileId: string, userId: string, expiresIn: number = 3600) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new BadRequestException('Unauthorized to access this file');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: file.s3Key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return { url: signedUrl, expiresIn };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate signed URL: ${error.message}`,
      );
    }
  }

  async getUserFiles(userId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where: { userId } }),
    ]);

    return {
      data: files,
      total,
      page,
      pageSize,
    };
  }

  private validateFile(file: Express.Multer.File) {
    const maxSize = this.configService.get('MAX_FILE_SIZE') || 5242880; // 5MB default
    const allowedTypes = (
      this.configService.get('ALLOWED_FILE_TYPES') || 'image/jpeg,image/png,image/gif'
    ).split(',');

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }
}
