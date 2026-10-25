import type { components } from "@/types/api";

/** One value of the backend's article category enum. */
export type ArticleCategory = NonNullable<
  components["schemas"]["UpdateArticleDto"]["categories"]
>[number];

/**
 * Every article category, for the filter dropdowns. Listing the values is the
 * only way to get them at runtime, since the generated OpenAPI file is types
 * only, so the two assertions below pin this list to that enum: `satisfies`
 * rejects a value the backend dropped, and `NoMissingCategory` rejects a value
 * the backend added. Either way the next `pnpm generate:api-types` turns a
 * backend enum change into a compile error here.
 */
export const ARTICLE_CATEGORIES = [
  "news",
  "blog",
  "research",
  "nodejs",
  "typescript",
  "tutorial",
  "other",
] as const satisfies readonly ArticleCategory[];

type AssertNever<T extends never> = T;
type NoMissingCategory = AssertNever<
  Exclude<ArticleCategory, (typeof ARTICLE_CATEGORIES)[number]>
>;
export type { NoMissingCategory };
