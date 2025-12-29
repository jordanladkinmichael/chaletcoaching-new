import AccountClient from "./AccountClient";
import { requireSession } from "@/lib/require-session";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  await requireSession("/account", resolvedSearchParams);
  return <AccountClient />;
}
