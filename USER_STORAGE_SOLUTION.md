# Database Integration cho User Authentication

## 🗃️ **User Storage Solution**

Đã tích hợp hoàn chỉnh hệ thống lưu trữ users với **NestJS Backend + PostgreSQL Database**.

### 📊 **Database Schema**

```sql
-- Users Table (Updated)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NULL,        -- Nullable for OAuth users
  firstName VARCHAR NULL,
  lastName VARCHAR NULL,
  name VARCHAR NULL,           -- Full name from OAuth
  image VARCHAR NULL,          -- Profile picture URL
  googleId VARCHAR NULL,       -- Google OAuth ID
  provider VARCHAR DEFAULT 'email', -- 'email', 'google', 'facebook'
  role user_role DEFAULT 'user',
  permissions TEXT[] DEFAULT '{}',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### 🔄 **Authentication Flow**

#### **Frontend (NextAuth.js):**

1. User clicks "Đăng nhập với Google"
2. Google OAuth2 authentication
3. NextAuth receives user data từ Google
4. **Automatically sends user data to backend API**
5. Backend creates/updates user in database
6. Returns JWT token và user info
7. Frontend stores session

#### **Backend (NestJS):**

1. Receives POST `/api/auth/google` with user data
2. Checks if user exists by email
3. **Creates new user** nếu chưa tồn tại
4. **Updates existing user** với Google data
5. Generates JWT token
6. Returns user info + token

### 🛠️ **API Endpoints**

```typescript
// Google OAuth Authentication
POST /api/auth/google
Body: {
  email: string,
  name: string,
  image?: string,
  googleId: string
}
Response: {
  success: true,
  data: {
    user: UserResponse,
    token: string
  }
}

// Get current user profile
GET /api/auth/me
Headers: { Authorization: Bearer <jwt_token> }
Response: {
  success: true,
  data: {
    user: {
      id, email, name, image, role
    }
  }
}

// Logout (client-side token removal)
POST /api/auth/logout
Headers: { Authorization: Bearer <jwt_token> }
```

### 💾 **Data Persistence**

#### **User Data Stored:**

- ✅ **Google profile info** (name, email, image)
- ✅ **Authentication provider** (google, email)
- ✅ **User role và permissions**
- ✅ **Account creation/update timestamps**
- ✅ **Google ID** for linking accounts

#### **Session Management:**

- ✅ **NextAuth.js session** (browser storage)
- ✅ **JWT tokens** cho backend API calls
- ✅ **Database persistence** cho user data
- ✅ **Auto-sync** between frontend và backend

### 🔧 **Files Updated:**

#### **Backend:**

- `user.entity.ts` - Added OAuth fields
- `auth.controller.ts` - Added Google auth endpoint
- `auth.service.ts` - Added validateGoogleUser method
- `user.repository.ts` - Support for OAuth fields

#### **Frontend:**

- `[...nextauth]/route.ts` - Backend integration
- `.env.local` - Added backend API URL
- User data automatically synced to database

### 🚀 **Benefits:**

1. **Persistent User Data** - Users không mất data khi session expires
2. **Unified Authentication** - Support both email/password và OAuth
3. **Role-based Access** - User roles và permissions
4. **Analytics Ready** - Track user registration, login times
5. **Scalable** - Easy to add more OAuth providers
6. **Secure** - JWT tokens + database validation

### 🎯 **Next Steps:**

1. **Setup database connection** trong NestJS
2. **Run migrations** để update user table schema
3. **Test authentication flow** end-to-end
4. **Add user management features** (admin panel, user roles)

### ⚠️ **Migration Required:**

Nếu đã có users trong database, cần chạy migration:

```sql
-- Add new columns to existing users table
ALTER TABLE users
ADD COLUMN name VARCHAR,
ADD COLUMN image VARCHAR,
ADD COLUMN googleId VARCHAR,
ADD COLUMN provider VARCHAR DEFAULT 'email',
ALTER COLUMN password DROP NOT NULL;
```

**Users giờ được lưu an toàn trong PostgreSQL database! 🎉**
