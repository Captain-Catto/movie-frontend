# Hướng dẫn setup Google OAuth2 Authentication

## Bước 1: Tạo Google Cloud Project và OAuth2 Credentials

### 1.1. Truy cập Google Cloud Console

- Đi tới [Google Cloud Console](https://console.cloud.google.com/)
- Đăng nhập với tài khoản Google

### 1.2. Tạo Project mới (nếu chưa có)

- Click "Select a project" ở header
- Click "New Project"
- Nhập tên project: `MovieStream Auth`
- Click "Create"

### 1.3. Enable Google+ API

- Vào menu "APIs & Services" > "Library"
- Tìm kiếm "Google+ API" hoặc "Google Identity"
- Click vào "Google+ API" và click "Enable"

### 1.4. Tạo OAuth2 Credentials

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Nếu chưa có OAuth consent screen:
   - Click "Configure consent screen"
   - Chọn "External" (cho testing)
   - Điền thông tin:
     - App name: `MovieStream`
     - User support email: email của bạn
     - Developer contact: email của bạn
   - Click "Save and Continue" qua tất cả bước
4. Tạo OAuth2 Client:
   - Application type: `Web application`
   - Name: `MovieStream Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Create"

### 1.5. Copy Client ID và Client Secret

- Sau khi tạo, copy `Client ID` và `Client Secret`

## Bước 2: Cấu hình Environment Variables

### 2.1. Tạo file `.env.local`

Tạo file `.env.local` trong thư mục `movie-frontend/movie-app/`:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 2.2. Thay thế values

- Thay `your-google-client-id-here` bằng Client ID từ Google
- Thay `your-google-client-secret-here` bằng Client Secret từ Google
- Tạo NEXTAUTH_SECRET bằng lệnh:
  ```bash
  openssl rand -base64 32
  ```
  Hoặc sử dụng online generator: https://generate-secret.now.sh/32

## Bước 3: Test Authentication

### 3.1. Khởi động development server

```bash
cd movie-frontend/movie-app
npm run dev
```

### 3.2. Test login flow

1. Mở http://localhost:3000
2. Click nút "Đăng nhập" ở header
3. Hoặc đi trực tiếp tới http://localhost:3000/login
4. Click "Đăng nhập với Google"
5. Chọn tài khoản Google và authorize
6. Sẽ redirect về trang chủ với trạng thái đã login

### 3.3. Test logout

- Click vào avatar/tên user ở header
- Click "Đăng xuất"

## Bước 4: Production Setup

### 4.1. Thêm production domains

Khi deploy lên production, thêm domain production vào Google OAuth2:

- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

### 4.2. Update environment variables

- Thay `NEXTAUTH_URL` thành production URL
- Tạo NEXTAUTH_SECRET mới cho production

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid Client: Invalid redirect URI"**

   - Kiểm tra redirect URI trong Google Console
   - Đảm bảo có `/api/auth/callback/google`

2. **"Error: Cannot find module 'next-auth'"**

   - Chạy `npm install next-auth`

3. **Session không persist**

   - Kiểm tra NEXTAUTH_SECRET
   - Kiểm tra NEXTAUTH_URL

4. **CORS errors**
   - Kiểm tra Authorized JavaScript origins

### Debug thông tin:

- Kiểm tra Network tab trong browser DevTools
- Xem console logs
- Kiểm tra file `.env.local` có đúng format không

## Tính năng đã implement:

✅ Google OAuth2 login/logout
✅ Session management with NextAuth
✅ User avatar và name display
✅ Login page với Google button
✅ Header integration với auth state
✅ Automatic redirect after login/logout
✅ Recent searches cleared on logout
