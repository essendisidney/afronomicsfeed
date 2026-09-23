export type ContentLabel = "Facts" | "Analysis" | "Opinion";

export type Category = "brief" | "weekly" | "explainer";

export type Source = {
  name: string;
  url: string;
  date: string;
};

export type ArticleFrontmatter = {
  title: string;
  date: string;
  authors: string[];
  category: Category;
  labels: ContentLabel[];
  sources: Source[];
  teaser: string[];
  summary: string;
  asOf?: string;
  gated?: boolean;
  topics?: string[];
  institutions?: string[];
  urgency?: "file" | "watch" | "cadence" | "reference";
  minutes?: number;
  fileFor?: string;
  soWhat?: string;
  unknowns?: string[];
};

export type Article = ArticleFrontmatter & {
  slug: string;
  body: string;
};

export type ArticleIndexItem = Omit<Article, "body">;
