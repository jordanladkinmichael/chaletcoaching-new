import DashboardClient from "./DashboardClient";
import { requireSession } from "@/lib/require-session";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  await requireSession("/dashboard", resolvedSearchParams);
  return <DashboardClient />;
}
