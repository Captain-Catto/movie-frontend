import { apiService } from "@/services/api";
import type { MovieCardData, TVSeries } from "@/types/content.types";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";

const HOME_SECTION_LIMIT = 10;
const HOME_TV_SECTION_LIMIT = 6;

export interface HomePageData {
  heroMovies: MovieCardData[];
  nowPlayingMovies: MovieCardData[];
  popularMovies: MovieCardData[];
  topRatedMovies: MovieCardData[];
  upcomingMovies: MovieCardData[];
  onTheAirTVSeries: MovieCardData[];
  popularTVSeries: MovieCardData[];
  topRatedTVSeries: MovieCardData[];
}

const toMovieCards = (items: unknown): MovieCardData[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  try {
    return mapMoviesToFrontend(items as never[]) as MovieCardData[];
  } catch {
    return [];
  }
};

const toTVSeriesCards = (items: unknown): MovieCardData[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  try {
    return mapTVSeriesToFrontendList(items as TVSeries[]) as MovieCardData[];
  } catch {
    return [];
  }
};

export async function getHomePageData(language: string): Promise<HomePageData> {
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
    apiService.getTrending({ page: 1, limit: HOME_SECTION_LIMIT, language }),
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
      limit: HOME_SECTION_LIMIT,
      language,
    }),
    apiService.getOnTheAirTVSeries({
      page: 1,
      limit: HOME_TV_SECTION_LIMIT,
      language,
    }),
    apiService.getPopularTVSeries({
      page: 1,
      limit: HOME_TV_SECTION_LIMIT,
      language,
    }),
    apiService.getTopRatedTVSeries({
      page: 1,
      limit: HOME_TV_SECTION_LIMIT,
      language,
    }),
  ]);

  const heroMovies =
    trendingRes.success && Array.isArray(trendingRes.data)
      ? (mapTrendingDataToFrontend(trendingRes.data) as MovieCardData[])
      : [];

  return {
    heroMovies,
    nowPlayingMovies: toMovieCards(nowPlayingRes.success ? nowPlayingRes.data : []),
    popularMovies: toMovieCards(popularRes.success ? popularRes.data : []),
    topRatedMovies: toMovieCards(topRatedRes.success ? topRatedRes.data : []),
    upcomingMovies: toMovieCards(upcomingRes.success ? upcomingRes.data : []),
    onTheAirTVSeries: toTVSeriesCards(onTheAirTVRes.success ? onTheAirTVRes.data : []),
    popularTVSeries: toTVSeriesCards(popularTVRes.success ? popularTVRes.data : []),
    topRatedTVSeries: toTVSeriesCards(topRatedTVRes.success ? topRatedTVRes.data : []),
  };
}
