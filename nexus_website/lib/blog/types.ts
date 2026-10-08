export type ContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "h2"; content: string }
  | { type: "h3"; content: string }
  | { type: "quote"; content: string }
  | { type: "list"; items: string[] };

export type BlogAuthor = {
  name: string;
  avatar?: string;
  role?: string;
  roleFr?: string;
};

export type BlogSEO = {
  metaTitle: string;
  metaDescription: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  titleFr: string;
  excerpt: string;
  excerptFr: string;
  content: ContentBlock[];
  contentFr: ContentBlock[];
  coverImage: string;
  author: BlogAuthor;
  date: string;
  category: string;
  categoryFr: string;
  tags: string[];
  readingTime: string;
  status: "published" | "draft";
  featured: boolean;
  seo: BlogSEO;
};

export type BlogPostSummary = Omit<BlogPost, "content" | "contentFr">;

export type BlogFilters = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
};
