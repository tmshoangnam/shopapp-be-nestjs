import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseUtil } from '../common/utils/response.util';

@ApiTags('File Upload')
@Controller('file')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('audio-upload')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload audio file',
    description: 'Upload audio file for karte records. Supports MP3, WAV, MP4, AAC, and OGG formats up to 20MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Audio file to upload',
        },
        karteId: {
          type: 'string',
          description: 'Optional karte record ID for custom naming',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Audio file uploaded successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        data: {
          url: 'https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/audio/karte-123-1703123456789.mp3',
          key: 'audio/karte-123-1703123456789.mp3',
          size: 2048576,
          mimetype: 'audio/mpeg',
        },
        message: 'Audio file uploaded successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Query('karteId') karteId?: string,
  ) {
    const result = await this.uploadService.uploadAudio(file, karteId);
    return ResponseUtil.success(result, 'Audio file uploaded successfully');
  }

  @Post('image-upload')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload image file',
    description: 'Upload image file. Supports JPEG, PNG, GIF, and WebP formats up to 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image file uploaded successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        data: {
          url: 'https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/images/1703123456789.jpg',
          key: 'images/1703123456789.jpg',
          size: 1024000,
          mimetype: 'image/jpeg',
        },
        message: 'Image file uploaded successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadImage(file);
    return ResponseUtil.success(result, 'Image file uploaded successfully');
  }

  @Post('document-upload')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload document file',
    description: 'Upload document file. Supports PDF, DOC, DOCX, XLS, XLSX, and TXT formats up to 50MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document file uploaded successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        data: {
          url: 'https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/documents/1703123456789.pdf',
          key: 'documents/1703123456789.pdf',
          size: 5120000,
          mimetype: 'application/pdf',
        },
        message: 'Document file uploaded successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadDocument(file);
    return ResponseUtil.success(result, 'Document file uploaded successfully');
  }

  @Get('download/:key')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get download URL for file',
    description: 'Generate a signed download URL for a file by its key.',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        data: {
          downloadUrl: 'https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/audio/karte-123-1703123456789.mp3?X-Amz-Algorithm=...',
          expiresIn: 3600,
        },
        message: 'Download URL generated successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getDownloadUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: number,
  ) {
    const downloadUrl = await this.uploadService.getDownloadUrl(key, expiresIn || 3600);
    return ResponseUtil.success(
      {
        downloadUrl,
        expiresIn: expiresIn || 3600,
      },
      'Download URL generated successfully',
    );
  }

  @Get('url/:key')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get public URL for file',
    description: 'Get the public URL for a file by its key.',
  })
  @ApiResponse({
    status: 200,
    description: 'File URL retrieved successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        data: {
          url: 'https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/audio/karte-123-1703123456789.mp3',
        },
        message: 'File URL retrieved successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getFileUrl(@Param('key') key: string) {
    const url = this.uploadService.getFileUrl(key);
    return ResponseUtil.success({ url }, 'File URL retrieved successfully');
  }
}
