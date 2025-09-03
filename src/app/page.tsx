'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/movie/HeroSection';
import CategoryGrid from '@/components/movie/CategoryGrid';
import MovieGrid from '@/components/movie/MovieGrid';
import { apiService } from '@/services/api';
import { mapMoviesToFrontend } from '@/utils/movieMapper';

export default function Home() {
  const [dynamicMovies, setDynamicMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const response = await apiService.getMovies({
          page: 1,
          limit: 10,
          language: 'vi-VN'
        });

        if (response.success && response.data) {
          const frontendMovies = mapMoviesToFrontend(response.data);
          setDynamicMovies(frontendMovies);
        }
      } catch (error) {
        console.error('Error fetching featured movies:', error);
        // Keep static data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);
  const heroMovies = [
    {
      id: '1',
      title: 'Mùa Hè Kinh Hãi',
      aliasTitle: 'I Know What You Did Last Summer',
      rating: 7.2,
      year: 2025,
      duration: '1h 51m',
      season: 'Phần 1',
      episode: 'Tập 14',
      genres: ['Chiếu Rạp', 'Gay Cấn', 'Kinh Dị', 'Bí Ẩn', 'Tâm Lý'],
      description: 'Khi năm người bạn vô tình gây ra một vụ tai nạn xe hơi chết người, họ quyết định che giấu và lập một giao ước giữ bí mật thay vì phải đối mặt với hậu quả. Một năm sau, quá khứ trở lại ám ảnh họ, buộc họ phải đối diện với một sự thật khủng khiếp: có ai đó biết những gì họ đã làm vào mùa hè năm ngoái… và quyết tâm trả thù họ.',
      backgroundImage: 'https://static.nutscdn.com/vimg/1920-0/d8a4ebcb52a0c7b9769298a843a355e6.webp',
      posterImage: 'https://static.nutscdn.com/vimg/0-260/5ced6fb31801f8d66238cbdfaa23136d.webp',
      scenes: [
        'https://static.nutscdn.com/vimg/150-0/d8a4ebcb52a0c7b9769298a843a355e6.webp',
        'https://static.nutscdn.com/vimg/150-0/29cca985f832ea53a5cefa528fa7f666.webp',
        'https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg',
      ]
    },
    {
      id: '2',
      title: 'Dính Lẹo',
      aliasTitle: 'Together',
      rating: 6.8,
      year: 2025,
      duration: '1h 42m',
      season: 'Phần 1',
      episode: 'Tập 8',
      genres: ['Chiếu Rạp', 'Gay Cấn', 'Kinh Dị', 'Tâm Lý'],
      description: 'Việc chuyển về vùng quê hẻo lánh đã đủ khiến mối quan hệ của cặp đôi này đứng bên bờ vực tan vỡ — nhưng một cuộc chạm trán siêu nhiên bất ngờ lại khởi đầu cho một sự biến đổi cực đoan về tình yêu, cuộc sống… và cả thể xác của họ.',
      backgroundImage: 'https://static.nutscdn.com/vimg/1920-0/a7d2094512631c096231413e5bce5e29.webp',
      posterImage: 'https://static.nutscdn.com/vimg/0-260/f4ba899bc021b4de498255efd6011274.png',
      scenes: [
        'https://static.nutscdn.com/vimg/150-0/29cca985f832ea53a5cefa528fa7f666.webp',
        'https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg',
        'https://static.nutscdn.com/vimg/150-0/7fb03fc7adc8de125e80bc0d67d0e841.webp',
      ]
    },
    {
      id: '3',
      title: 'Elio: Cậu Bé Đến Từ Trái Đất',
      aliasTitle: 'Elio',
      rating: 7.0,
      year: 2025,
      duration: '1h 37m',
      season: 'Phần 1',
      episode: 'Full',
      genres: ['Chiếu Rạp', 'Gia Đình', 'Khoa Học', 'Thiếu Nhi', 'Hài', 'Hoạt Hình', 'Phiêu Lưu'],
      description: 'Điều gì sẽ xảy ra nếu chính thứ bạn đang tìm kiếm lại tìm đến bạn trước? Trong cuộc phiêu lưu dở khóc dở cười trên màn ảnh rộng của Pixar, Elio – cậu bé mê mẩn người ngoài hành tinh – bất ngờ bị cuốn vào Liên Hiệp Thiên Hà.',
      backgroundImage: 'https://static.nutscdn.com/vimg/1920-0/b83f91db6c94d70423914163dc77feae.jpg',
      posterImage: 'https://static.nutscdn.com/vimg/0-260/0e7257a6bfb5434095c2d425aa7306a5.png',
      scenes: [
        'https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg',
        'https://static.nutscdn.com/vimg/150-0/7fb03fc7adc8de125e80bc0d67d0e841.webp',
        'https://static.nutscdn.com/vimg/150-0/fdf26f9295adea7a951f615d6171cfc2.jpg',
      ]
    }
  ];

  const categories = [
    {
      id: '1',
      name: 'Action',
      backgroundImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '2',
      name: 'Drama',
      backgroundImage: 'https://images.unsplash.com/photo-1489599858765-d6bf4d1c6f4b?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '3',
      name: 'Comedy',
      backgroundImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '4',
      name: 'Thriller',
      backgroundImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '5',
      name: 'Romance',
      backgroundImage: 'https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '6',
      name: 'Horror',
      backgroundImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '7',
      name: 'Sci-Fi',
      backgroundImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '8',
      name: 'Fantasy',
      backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=500&q=60'
    }
  ];

  const featuredMovies = [
    {
      id: '1',
      title: 'Dune: Part Two',
      aliasTitle: 'Dune: Phần Hai',
      poster: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=500&q=80',
      href: '/movie/1',
      year: 2024,
      genre: 'Sci-Fi'
    },
    {
      id: '2',
      title: 'Oppenheimer',
      aliasTitle: 'Oppenheimer',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=80',
      href: '/movie/2',
      year: 2023,
      genre: 'Drama'
    },
    {
      id: '3',
      title: 'The Batman',
      aliasTitle: 'Người Dơi',
      poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80',
      href: '/movie/3',
      year: 2024,
      genre: 'Action'
    },
    {
      id: '4',
      title: 'Inception',
      aliasTitle: 'Kỷ Nguyên',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80',
      href: '/movie/4',
      year: 2023,
      genre: 'Thriller'
    },
    {
      id: '5',
      title: 'Avatar 3',
      aliasTitle: 'Thế Thần - Phần 3',
      poster: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=500&q=80',
      href: '/movie/5',
      year: 2024,
      genre: 'Fantasy'
    },
    {
      id: '6',
      title: 'Spider-Man',
      aliasTitle: 'Người Nhện',
      poster: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=500&q=80',
      href: '/movie/6',
      year: 2024,
      genre: 'Action'
    },
    {
      id: '7',
      title: 'Black Panther',
      aliasTitle: 'Báo Đen',
      poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80',
      href: '/movie/7',
      year: 2023,
      genre: 'Action'
    },
    {
      id: '8',
      title: 'Interstellar',
      aliasTitle: 'Hố Đen Tử Thần',
      poster: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=500&q=80',
      href: '/movie/8',
      year: 2023,
      genre: 'Sci-Fi'
    },
    {
      id: '9',
      title: 'Wonder Woman',
      aliasTitle: 'Nữ Thần Chiến Binh',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=500&q=80',
      href: '/movie/9',
      year: 2024,
      genre: 'Action'
    },
    {
      id: '10',
      title: 'Doctor Strange',
      aliasTitle: 'Bác Sĩ Tử Thần',
      poster: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=500&q=80',
      href: '/movie/10',
      year: 2023,
      genre: 'Fantasy'
    }
  ];

  // Use fetched movies if available, otherwise fall back to static data
  const moviesToDisplay = dynamicMovies.length > 0 ? dynamicMovies : featuredMovies.slice(0, 10);

  return (
    <Layout>
      <HeroSection movies={heroMovies} />
      <CategoryGrid categories={categories} />
      <MovieGrid movies={moviesToDisplay} showFilters={false} />
      {loading && (
        <div className="text-center text-white py-8">
          Đang tải phim từ backend...
        </div>
      )}
    </Layout>
  );
}
