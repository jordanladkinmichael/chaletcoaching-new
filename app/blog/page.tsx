import BlogIndexClient from "@/components/blog/blog-index-client";
import { getBlogCopy } from "@/lib/blog-copy";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getBlogCopy(locale);
  return {
    title: copy.metadata.indexTitle,
    description: copy.metadata.indexDescription,
  };
}

export default function BlogPage() {
  return <BlogIndexClient />;
}
