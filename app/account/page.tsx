import AccountClient from "./AccountClient";
import { requireSession } from "@/lib/require-session";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  await requireSession("/account", searchParams);
  return <AccountClient />;
}
