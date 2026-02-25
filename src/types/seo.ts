export interface SeoMetadata {
  id: number;
  pageType: string;
  path: string;
  locale: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
