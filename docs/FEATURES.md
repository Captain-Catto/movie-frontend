# Tính năng chính (Frontend)

Tài liệu này mô tả các tính năng chính đang có trong frontend `movie-app` (Next.js App Router) và các luồng sử dụng cho người dùng và quản trị.

## 1. Nhóm tính năng cho người dùng

### 1.1. Trang chủ

- Hero section hiển thị nội dung nổi bật (lấy từ dữ liệu trending; có dữ liệu dự phòng khi API lỗi).
- Các dải nội dung theo danh mục: Now Playing, Popular, Top Rated, Upcoming, và các nhóm TV Series.
- Lazy-load theo scroll bằng Intersection Observer; số lượng item tự điều chỉnh theo kích thước màn hình.

### 1.2. Duyệt nội dung

- Danh sách nội dung theo trang:
  - `GET /movies` (Movies)
  - `GET /tv` (TV Series)
  - `GET /trending` (Trending)
- Danh mục Movies:
  - `/movies/now-playing`
  - `/movies/popular`
  - `/movies/top-rated`
  - `/movies/upcoming`
- Danh mục TV Series:
  - `/tv/on-the-air`
  - `/tv/popular`
  - `/tv/top-rated`
- Trang `/browse` hỗ trợ bộ lọc:
  - Quốc gia, thể loại, năm (hoặc customYear), sắp xếp (sortBy)
  - Chọn nguồn nội dung qua `type=movie|tv|trending`
  - Với `trending`, lọc theo thể loại được xử lý phía client (vì backend không áp filter genre cho trending)

### 1.3. Chi tiết nội dung

- Trang chi tiết `/movie/[id]`:
  - Tự nhận diện movie hay TV series bằng cách thử gọi movie trước, sau đó fallback sang TV.
  - Hiển thị poster, backdrop, mô tả, rating, năm phát hành, runtime, ngôn ngữ, trạng thái, quốc gia.
  - Hiển thị cast và director (lấy từ credits).
  - Nút Watch Now dẫn tới trang xem `/watch/[id]` với prefix `movie-<tmdbId>` hoặc `tv-<tmdbId>`.
  - Nút Trailer (lấy danh sách video từ TMDB) và danh sách gợi ý (recommendations).

### 1.4. Xem phim

- Trang xem `/watch/[id]`:
  - Hỗ trợ id có prefix `movie-123`, `tv-456` hoặc id dạng số.
  - Trình phát đang dùng thẻ HTML5 `video`; nguồn stream hiện là video mẫu (demo) để kiểm thử UI/UX.
  - Có thể ẩn header khi đang phát (và tự hiện lại khi người dùng scroll).
  - Hiển thị thông tin nội dung, cast và danh sách gợi ý.
  - Tích hợp hệ thống bình luận cho movie hoặc TV series.

### 1.5. Tìm kiếm

- Modal tìm kiếm mở từ header:
  - Debounce 600ms để giảm số lượng request.
  - Tab lọc theo loại: movie, tv, all.
  - Hỗ trợ load thêm kết quả theo trang (load more).
- Lịch sử tìm kiếm:
  - Khách: lưu ở localStorage (`recentSearches`).
  - Đăng nhập: đồng bộ với backend qua `/search/recent`, tự merge lịch sử local và server.

### 1.6. Tài khoản và xác thực

- Đăng nhập/đăng ký bằng email và mật khẩu (Auth Modal trong header).
- Đăng nhập Google theo flow popup:
  - Frontend tạo Google OAuth URL (scope `openid email profile`).
  - Callback tại `/auth/google/callback`, trích xuất `id_token` và gửi dữ liệu sang backend `/auth/google`.
- Lưu `token` và `refreshToken` ở localStorage.
- Axios interceptor tự gắn `Authorization: Bearer <token>` và tự refresh token khi gặp 401 (gọi `/api/auth/refresh`).
- Trang `/account` hiển thị thông tin tài khoản (email, tên, role) và các mục cài đặt (hiện là UI placeholder).

### 1.7. Favorites

- Nút yêu thích (favorite) trên card/chi tiết/xem phim cho phép add hoặc remove.
- Trang `/favorites` hiển thị danh sách yêu thích và phân trang.
- Tối ưu trải nghiệm:
  - Có endpoint check nhanh trạng thái yêu thích cho từng item (`/favorites/check/:contentId/:contentType`).
  - Favorites loader/provider tải danh sách yêu thích khi đăng nhập để render trạng thái nhanh.

### 1.8. Bình luận

- Bình luận hiển thị trong trang xem:
  - Tạo bình luận, reply theo dạng cây (giới hạn độ sâu).
  - Sửa, xoá bình luận (tuỳ theo quyền/logic backend).
  - Like/dislike, report bình luận.
  - Load thêm theo trang.
  - Hỗ trợ tìm user cho mention qua endpoint `/comments/users/search`.

### 1.9. Thông báo

- Dropdown thông báo trong header (chỉ hiển thị khi đã đăng nhập):
  - Badge số lượng chưa đọc.
  - Hiển thị 10 thông báo gần nhất.
  - Đánh dấu đã đọc hoặc đánh dấu tất cả đã đọc.
  - Click vào thông báo có thể điều hướng sang trang xem nếu metadata có `movieId` hoặc `tvId`.
- Trang `/notifications`:
  - Hiển thị danh sách theo nhóm ngày.
  - Bộ lọc chỉ hiển thị thông báo chưa đọc.
- Realtime notifications:
  - Kết nối Socket.IO namespace `/notifications`.
  - Nhận sự kiện `notification:new` và `notification:unread-count`.

### 1.10. Continue Watching

- Trang `/continue-watching` có UI cho tính năng "xem tiếp".
- Hiện tại trang này đang là placeholder (chưa có cơ chế lưu/đọc lịch sử xem thực tế).

## 2. Khu vực quản trị (Admin)

Khu vực admin yêu cầu tài khoản có role `admin` hoặc `super_admin` từ backend.

- Dashboard `/admin`:
  - Thống kê tổng quan (movies, TV series, users, tổng nội dung).
  - Theo dõi trạng thái đồng bộ dữ liệu và trigger sync thủ công.
- Quản lý nội dung `/admin/content`:
  - Tab Movies, TV Series, Trending.
  - Tìm kiếm theo tên (movies/tv), lọc trạng thái active/blocked.
  - Block/unblock nội dung; với Trending có thêm hide/unhide item trong carousel.
- Quản lý người dùng `/admin/users`:
  - Danh sách user, lọc all/active/banned.
  - Ban/unban user và ghi nhận lý do ban.
- Analytics `/admin/analytics`:
  - Overview, biểu đồ views theo thời gian, popular content.
  - Thống kê theo device và country.
  - Bộ lọc theo khoảng thời gian và loại nội dung.
- Quản lý thông báo `/admin/notifications`:
  - Gửi thông báo cho tất cả, theo role hoặc theo user.
  - Xem lịch sử đã gửi và xóa thông báo.
- SEO `/admin/seo`:
  - CRUD metadata theo pageType và path.
  - Bật/tắt trạng thái active, setup defaults.
  - SEO checker để rà soát thông tin cơ bản.
- Sync data `/admin/sync-data`:
  - Trigger sync theo target (all, movies, tv, popular, today).
  - Hỗ trợ chọn ngày TMDB export (tuỳ chọn).

## 3. Cấu hình môi trường quan trọng

- `NEXT_PUBLIC_API_BASE_URL`: base URL backend (ví dụ `http://localhost:8080`).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: client id dùng cho Google OAuth popup.
- `NEXT_PUBLIC_APP_URL`: URL frontend (phục vụ một số luồng liên quan tới popup/redirect).
