# MovieStream - Movie Website Frontend

Trang web xem phim trực tuyến được xây dựng bằng React, Next.js 14, và shadcn/ui.

## 🚀 Công nghệ sử dụng

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety và development experience tốt hơn
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Custom Fonts** - Inter và Roboto từ Google Fonts

## 🎨 Tính năng

- ✅ Dark theme với màu sắc giống Netflix
- ✅ Responsive design cho mobile và desktop
- ✅ Header navigation với menu hamburger
- ✅ Hero section với background image và gradient overlay
- ✅ Movie information display (rating, year, duration, season, episode)
- ✅ Genre tags
- ✅ Action buttons (Xem Phim, Chi Tiết)
- ✅ Scene thumbnails preview
- ✅ Popular categories grid
- ✅ Hover effects và smooth transitions

## 📦 Cài đặt

```bash
# Clone repository
git clone <your-repo-url>
cd movie-app

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── globals.css          # Global styles và Tailwind config
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Navigation header
│   │   └── Layout.tsx       # Main layout wrapper
│   ├── movie/
│   │   ├── CategoryGrid.tsx # Popular categories grid
│   │   ├── HeroSection.tsx  # Hero section với movie info
│   │   ├── MovieInfo.tsx    # Movie details component
│   │   └── SceneThumbnails.tsx # Scene preview thumbnails
│   └── ui/                  # shadcn/ui components
└── lib/
    ├── fonts.ts             # Font configuration
    └── utils.ts             # Utility functions
```

## 🎨 Design System

### Colors

- **Background**: Dark gray (#111827)
- **Cards**: Lighter dark gray (#1F2937)
- **Primary (Red)**: #DC2626
- **Text**: White (#FFFFFF)
- **Secondary text**: Gray shades

### Typography

- **Primary font**: Inter
- **Secondary font**: Roboto
- **Responsive font sizes**

## 📱 Responsive Design

- **Mobile**: Hamburger menu, stacked layout
- **Tablet**: 2-column category grid
- **Desktop**: Full navigation, 4-column category grid

## 🚀 Deployment

```bash
# Build cho production
npm run build

# Chạy production build
npm start
```

## 📄 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run start` - Chạy production server
- `npm run lint` - Check code quality

## 🛠️ Development Notes

- Dự án sử dụng Tailwind CSS v4 với CSS variables
- Không sử dụng icons, thay thế bằng CSS shapes
- Components được viết theo functional style với TypeScript
- Sử dụng Next.js App Router
- shadcn/ui components được tùy chỉnh theo theme

---

Made with ❤️ using Next.js và shadcn/ui
