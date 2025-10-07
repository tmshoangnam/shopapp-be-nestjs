# 🎯 Hướng dẫn Setup Chat System

## 📋 Tổng quan

Hệ thống chat đã được tách thành 2 phần riêng biệt:
- **Chat Client** - Giao diện cho người dùng cuối
- **Chat Server Admin** - Giao diện quản trị cho admin

## 🚀 Cách chạy

### 1. **Backend Server (NestJS)**
```bash
# Đảm bảo server đang chạy
npm run start:dev

# Server sẽ chạy trên: http://localhost:4000
# WebSocket endpoint: ws://localhost:4000
```

### 2. **Chat Client (Frontend)**
```bash
# Mở file trong trình duyệt
open chat-client/index.html

# Hoặc serve static files
npx serve chat-client -p 3000
# Truy cập: http://localhost:3000
```

### 3. **Chat Server Admin**
```bash
# Mở file trong trình duyệt
open chat-server/admin.html

# Hoặc serve static files
npx serve chat-server -p 3001
# Truy cập: http://localhost:3001/admin.html
```

## 🔧 Cấu hình

### **1. Database Setup**
```bash
# Chạy migrations
npx prisma migrate dev

# Seed data nếu cần
npm run db:seed
```

### **2. Environment Variables**
Đảm bảo file `.env` có các biến:
```env
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
PORT=4000
```

### **3. CORS Configuration**
WebSocket đã được cấu hình CORS cho:
- `http://localhost:3000` (Chat Client)
- `http://localhost:3001` (Chat Server Admin)

## 📱 Tính năng Chat Client

### **Đăng nhập**
- Sử dụng email/password từ database
- JWT token được lưu và sử dụng cho WebSocket

### **Giao diện**
- ✅ Danh sách cuộc trò chuyện
- ✅ Chat real-time
- ✅ Typing indicator
- ✅ Unread count
- ✅ Responsive design

### **WebSocket Events**
- `send-message` - Gửi tin nhắn
- `new-message` - Nhận tin nhắn mới
- `typing` - Typing indicator
- `mark-as-read` - Đánh dấu đã đọc

## 🛠️ Tính năng Chat Server Admin

### **Dashboard**
- ✅ Thống kê real-time
- ✅ Danh sách users online
- ✅ Tổng số tin nhắn

### **Quản lý Chat**
- ✅ Chat với bất kỳ user nào
- ✅ Xem tất cả tin nhắn
- ✅ Export cuộc trò chuyện
- ✅ Xóa cuộc trò chuyện
- ✅ Đánh dấu đã đọc

### **Admin Actions**
- `markAllAsRead()` - Đánh dấu tất cả đã đọc
- `exportChat()` - Export JSON
- `clearChat()` - Xóa cuộc trò chuyện

## 🔌 API Endpoints

### **Chat APIs**
```bash
# Lấy tin nhắn
GET /api/v1/chat/messages

# Lấy cuộc trò chuyện
GET /api/v1/chat/conversations

# Đếm tin nhắn chưa đọc
GET /api/v1/chat/unread-count

# Đánh dấu đã đọc
PUT /api/v1/chat/mark-as-read

# Xóa tin nhắn
DELETE /api/v1/chat/message/:messageId
```

### **Admin APIs**
```bash
# Tất cả tin nhắn (Admin only)
GET /api/v1/chat/admin/all-messages

# Users online (Admin only)
GET /api/v1/chat/admin/online-users

# Thống kê chat (Admin only)
GET /api/v1/chat/admin/stats
```

## 🧪 Test Chat System

### **1. Test Client**
1. Mở `chat-client/index.html`
2. Đăng nhập với user có trong database
3. Test gửi/nhận tin nhắn

### **2. Test Admin**
1. Mở `chat-server/admin.html`
2. Kết nối WebSocket
3. Test các tính năng admin

### **3. Test Multi-User**
1. Mở 2 tab client với 2 user khác nhau
2. Test chat giữa 2 user
3. Test admin có thể thấy tất cả

## 🎨 Customization

### **Styling**
- CSS được viết inline trong HTML
- Dễ dàng customize colors, fonts, layout
- Responsive design cho mobile

### **Features**
- Có thể thêm emoji picker
- File upload
- Voice messages
- Message reactions

## 🚨 Troubleshooting

### **Lỗi kết nối WebSocket**
```bash
# Kiểm tra server có chạy không
curl http://localhost:4000/health

# Kiểm tra port
netstat -an | findstr :4000
```

### **Lỗi CORS**
- Kiểm tra `FRONTEND_URL` trong `.env`
- Đảm bảo client chạy đúng port

### **Lỗi JWT**
- Kiểm tra `JWT_SECRET` trong `.env`
- Đảm bảo user đã đăng nhập thành công

### **Lỗi Database**
```bash
# Reset database
npm run db:reset

# Kiểm tra schema
npx prisma studio
```

## 📊 Monitoring

### **Logs**
```bash
# Xem logs real-time
tail -f logs/combined.log

# Xem logs lỗi
tail -f logs/error.log
```

### **Database Queries**
```sql
-- Xem tin nhắn mới nhất
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;

-- Xem users online
SELECT DISTINCT sender_id FROM chat_messages 
WHERE created_at > NOW() - INTERVAL 5 MINUTE;
```

## 🔒 Security

### **Authentication**
- JWT token required cho WebSocket
- Role-based access cho admin APIs
- Input validation cho tất cả messages

### **Rate Limiting**
- Có thể thêm rate limiting cho WebSocket
- Giới hạn số tin nhắn per minute

### **Data Privacy**
- Messages được lưu trong database
- Admin có thể xem tất cả messages
- Có thể thêm encryption cho sensitive data

## 🚀 Production Deployment

### **1. Build Frontend**
```bash
# Tạo production build
npm run build

# Serve static files
npx serve dist -p 4000
```

### **2. Environment**
```env
NODE_ENV=production
JWT_SECRET=strong-secret-key
FRONTEND_URL=https://yourdomain.com
PORT=4000
```

### **3. Database**
```bash
# Production migration
npx prisma migrate deploy

# Backup database
pg_dump your_database > backup.sql
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs
2. Kiểm tra database connection
3. Kiểm tra WebSocket connection
4. Kiểm tra CORS configuration
5. Kiểm tra JWT token validity

