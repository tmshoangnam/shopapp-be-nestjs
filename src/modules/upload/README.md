# Upload Module

Module xử lý upload file cho hệ thống Karte, hỗ trợ cả local storage (development) và AWS S3 (production).

## 🚀 Tính năng

- **Multi-storage support**: Tự động chuyển đổi giữa local storage và S3 dựa trên environment
- **File validation**: Kiểm tra kích thước, định dạng file
- **Multiple file types**: Hỗ trợ audio, image, document
- **Signed URLs**: Tạo URL tải xuống có thời hạn
- **Error handling**: Xử lý lỗi toàn diện

## 📁 Cấu trúc

```
src/modules/upload/
├── upload.controller.ts    # API endpoints
├── upload.service.ts       # Business logic
├── storage.service.ts      # Storage abstraction
├── upload.module.ts        # Module definition
└── README.md              # Documentation
```

## 🔧 Cấu hình

### Environment Variables

```env
# AWS S3 Configuration
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="karte-audio-bucket"

# File Upload Configuration
MAX_AUDIO_FILE_SIZE=20971520    # 20MB
MAX_IMAGE_FILE_SIZE=10485760    # 10MB
MAX_DOCUMENT_FILE_SIZE=52428800 # 50MB

# Webhook Configuration
N8N_WEBHOOK_URL="https://n8n.d-soft.info.vn/webhook/audio-uploaded"
```

### Local Development

Files sẽ được lưu trong thư mục `uploads/`:
```
uploads/
├── audio/      # Audio files
├── images/     # Image files
└── documents/  # Document files
```

## 📡 API Endpoints

### Upload Audio
```http
POST /api/v1/file/audio-upload
Content-Type: multipart/form-data

{
  "file": <audio_file>,
  "karteId": "123" // optional
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 201,
  "data": {
    "url": "https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/audio/karte-123-1703123456789.mp3",
    "key": "audio/karte-123-1703123456789.mp3",
    "size": 2048576,
    "mimetype": "audio/mpeg"
  },
  "message": "Audio file uploaded successfully"
}
```

### Upload Image
```http
POST /api/v1/file/image-upload
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

### Upload Document
```http
POST /api/v1/file/document-upload
Content-Type: multipart/form-data

{
  "file": <document_file>
}
```

### Get Download URL
```http
GET /api/v1/file/download/{key}?expiresIn=3600
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "downloadUrl": "https://karte-audio-bucket.s3.ap-southeast-1.amazonaws.com/audio/file.mp3?X-Amz-Algorithm=...",
    "expiresIn": 3600
  },
  "message": "Download URL generated successfully"
}
```

### Get File URL
```http
GET /api/v1/file/url/{key}
```

## 🎵 Karte Records Integration

### Upload Audio for Karte
```http
POST /api/v1/karte/{id}/upload-audio
Content-Type: multipart/form-data

{
  "file": <audio_file>
}
```

**Tính năng:**
- Upload audio file cho karte record cụ thể
- Tự động cập nhật `audioUrl` trong database
- Chuyển status thành `IN_PROGRESS`
- Trigger webhook cho AI processing

### Download Karte Audio
```http
GET /api/v1/karte/{id}/download-audio
```

## 📋 File Validation

### Audio Files
- **Formats**: MP3, WAV, MP4, AAC, OGG
- **Max Size**: 20MB
- **MIME Types**: `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/aac`, `audio/ogg`

### Image Files
- **Formats**: JPEG, PNG, GIF, WebP
- **Max Size**: 10MB
- **MIME Types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### Document Files
- **Formats**: PDF, DOC, DOCX, XLS, XLSX, TXT
- **Max Size**: 50MB
- **MIME Types**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## 🔄 Webhook Integration

Khi upload audio cho karte record, hệ thống sẽ:

1. Upload file lên storage (local/S3)
2. Cập nhật `audioUrl` trong database
3. Chuyển status thành `IN_PROGRESS`
4. Trigger webhook đến N8N:
   ```json
   {
     "karteId": "123",
     "audioUrl": "https://...",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "event": "audio_uploaded"
   }
   ```

## 🛠️ Usage Examples

### Upload Audio with Karte ID
```typescript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('karteId', '123');

const response = await fetch('/api/v1/file/audio-upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Upload Audio for Specific Karte Record
```typescript
const formData = new FormData();
formData.append('file', audioFile);

const response = await fetch('/api/v1/karte/123/upload-audio', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔒 Security

- **Authentication**: Tất cả endpoints yêu cầu JWT token
- **Authorization**: Chỉ `STAFF`, `ADMIN`, `SUPER_ADMIN` có quyền upload
- **File Validation**: Kiểm tra kích thước và định dạng file
- **Signed URLs**: URLs tải xuống có thời hạn hết hạn

## 🚀 Mở rộng

Module được thiết kế để dễ dàng mở rộng:

1. **Thêm file types mới**: Cập nhật validation trong `UploadService`
2. **Thêm storage providers**: Implement interface trong `StorageService`
3. **Thêm webhook events**: Mở rộng `WebhookService`
4. **Thêm file processing**: Tích hợp với AI/ML services

## 📝 Notes

- Trong development: files lưu local trong `uploads/`
- Trong production: files upload lên AWS S3
- Webhook failures không làm gián đoạn flow chính
- File names được generate tự động để tránh conflicts
