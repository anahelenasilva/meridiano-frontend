import { Article } from "@/types";

export function getArticleImage(article: Article) {
  return article.image_url || "/default_article_cover.png";
}
