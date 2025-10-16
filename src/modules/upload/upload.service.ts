import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService, UploadResult } from './storage.service';

export interface AudioUploadDto {
  file: Express.Multer.File;
  karteId?: string;
}

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async uploadAudio(file: Express.Multer.File, karteId?: string): Promise<UploadResult> {
    // Validate file
    this.validateAudioFile(file);

    // Generate custom filename if karteId is provided
    const customFileName = karteId ? `karte-${karteId}-${Date.now()}.mp3` : undefined;

    // Upload file
    const result = await this.storageService.uploadFile(file, 'audio', customFileName);

    return result;
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'images'): Promise<UploadResult> {
    // Validate image file
    this.validateImageFile(file);

    // Upload file
    const result = await this.storageService.uploadFile(file, folder);

    return result;
  }

  async uploadDocument(file: Express.Multer.File, folder: string = 'documents'): Promise<UploadResult> {
    // Validate document file
    this.validateDocumentFile(file);

    // Upload file
    const result = await this.storageService.uploadFile(file, folder);

    return result;
  }

  async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return this.storageService.getSignedDownloadUrl(key, expiresIn);
  }

  async deleteFile(key: string): Promise<void> {
    return this.storageService.deleteFile(key);
  }

  getFileUrl(key: string): string {
    return this.storageService.getFileUrl(key);
  }

  private validateAudioFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 20MB limit');
    }

    // Check file type
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only MP3, WAV, MP4, AAC, and OGG audio files are allowed',
      );
    }

    // Check file extension
    const allowedExtensions = ['.mp3', '.wav', '.mp4', '.aac', '.ogg'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Invalid file extension. Only .mp3, .wav, .mp4, .aac, and .ogg files are allowed',
      );
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (10MB limit for images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed',
      );
    }
  }

  private validateDocumentFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (50MB limit for documents)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    // Check file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed',
      );
    }
  }
}
