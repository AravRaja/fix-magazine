// WordPress REST API response shapes

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  meta: Record<string, unknown>;
  acf?: Record<string, unknown>;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes?: Record<string, { source_url: string }>;
  };
}

export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  parent: number; // 0 = top-level
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
}

// Clean output shape

export interface FeaturedImage {
  remoteUrl: string;
  localPath: string;
  alt: string;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  author: Author;
  categories: string[];
  tags: string[];
  featuredImage: FeaturedImage | null;
  contentImages: FeaturedImage[];
  rating: number | null;
  sourceUrl: string;
}

export interface ArticleIndexEntry {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: Author;
  categories: string[];
  tags: string[];
  featuredImage: FeaturedImage | null;
  rating: number | null;
  sourceUrl: string;
}
