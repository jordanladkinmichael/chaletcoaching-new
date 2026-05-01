import BlogArticleClient from "@/components/blog/blog-article-client";
import { getBlogArticle } from "@/lib/blog-copy";
import { getServerLocale } from "@/lib/i18n/server";

const slug = "bands-only-hiit-30min";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const article = getBlogArticle(locale, slug);
  return {
    title: `${article.title} - Chaletcoaching`,
    description: article.description,
  };
}

export default function BandsOnlyHIITPage() {
  return <BlogArticleClient slug={slug} />;
}
