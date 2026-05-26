import { apiService } from "@/services/api";
import type { MovieCardData, TVSeries } from "@/types/content.types";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import type { HomePageData, InitialHomePageData } from "@/lib/page-data.types";

const HOME_SECTION_LIMIT = 10;
const HOME_HERO_LIMIT = 6;
const HOME_UPCOMING_SECTION_LIMIT = 24;
const HOME_TV_SECTION_LIMIT = 6;
const HOME_TV_POPULAR_SECTION_LIMIT = 15;
const HOME_TV_TOP_RATED_SECTION_LIMIT = 10;

const toMovieCards = (items: unknown, language: string): MovieCardData[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  try {
    return mapMoviesToFrontend(items as never[], language) as MovieCardData[];
  } catch {
    return [];
  }
};

const toTVSeriesCards = (items: unknown, language: string): MovieCardData[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  try {
    return mapTVSeriesToFrontendList(items as TVSeries[], language) as MovieCardData[];
  } catch {
    return [];
  }
};

export async function getHomePageData(
  language: string
): Promise<HomePageData> {
  const [
    trendingRes,
    nowPlayingRes,
    popularRes,
    topRatedRes,
    upcomingRes,
    onTheAirTVRes,
    popularTVRes,
    topRatedTVRes,
  ] = await Promise.all([
    apiService.getTrending({ page: 1, limit: HOME_HERO_LIMIT, language }),
    apiService.getNowPlayingMovies({
      page: 1,
      limit: HOME_SECTION_LIMIT,
      language,
    }),
    apiService.getPopularMovies({ page: 1, limit: HOME_SECTION_LIMIT, language }),
    apiService.getTopRatedMovies({
      page: 1,
      limit: HOME_SECTION_LIMIT,
      language,
    }),
    apiService.getUpcomingMovies({
      page: 1,
      limit: HOME_UPCOMING_SECTION_LIMIT,
      language,
    }),
    apiService.getOnTheAirTVSeries({
      page: 1,
      limit: HOME_TV_SECTION_LIMIT,
      language,
    }),
    apiService.getPopularTVSeries({
      page: 1,
      limit: HOME_TV_POPULAR_SECTION_LIMIT,
      language,
    }),
    apiService.getTopRatedTVSeries({
      page: 1,
      limit: HOME_TV_TOP_RATED_SECTION_LIMIT,
      language,
    }),
  ]);

  const heroMovies =
    trendingRes.success && Array.isArray(trendingRes.data)
      ? (mapTrendingDataToFrontend(trendingRes.data) as MovieCardData[])
      : [];

  return {
    heroMovies,
    nowPlayingMovies: toMovieCards(nowPlayingRes.success ? nowPlayingRes.data : [], language),
    popularMovies: toMovieCards(popularRes.success ? popularRes.data : [], language),
    topRatedMovies: toMovieCards(topRatedRes.success ? topRatedRes.data : [], language),
    upcomingMovies: toMovieCards(upcomingRes.success ? upcomingRes.data : [], language),
    onTheAirTVSeries: toTVSeriesCards(onTheAirTVRes.success ? onTheAirTVRes.data : [], language),
    popularTVSeries: toTVSeriesCards(popularTVRes.success ? popularTVRes.data : [], language),
    topRatedTVSeries: toTVSeriesCards(topRatedTVRes.success ? topRatedTVRes.data : [], language),
  };
}

export async function getInitialHomePageData(
  language: string
): Promise<InitialHomePageData> {
  const [
    trendingRes,
    nowPlayingRes,
    popularRes,
    topRatedRes,
  ] = await Promise.all([
    apiService.getTrending({ page: 1, limit: HOME_HERO_LIMIT, language }),
    apiService.getNowPlayingMovies({
      page: 1,
      limit: HOME_SECTION_LIMIT,
      language,
    }),
    apiService.getPopularMovies({ page: 1, limit: HOME_SECTION_LIMIT, language }),
    apiService.getTopRatedMovies({
      page: 1,
      limit: HOME_SECTION_LIMIT,
      language,
    }),
  ]);

  const heroMovies =
    trendingRes.success && Array.isArray(trendingRes.data)
      ? (mapTrendingDataToFrontend(trendingRes.data) as MovieCardData[])
      : [];

  return {
    heroMovies,
    nowPlayingMovies: toMovieCards(nowPlayingRes.success ? nowPlayingRes.data : [], language),
    popularMovies: toMovieCards(popularRes.success ? popularRes.data : [], language),
    topRatedMovies: toMovieCards(topRatedRes.success ? topRatedRes.data : [], language),
  };
}

