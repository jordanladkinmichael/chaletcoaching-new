import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type SearchParams = Record<string, string | string[] | undefined>;

function buildReturnTo(pathname: string, searchParams?: SearchParams) {
  if (!searchParams) return pathname;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined) params.append(key, item);
      });
    } else if (value !== undefined) {
      params.append(key, value);
    }
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export async function requireSession(pathname: string, searchParams?: SearchParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    const returnTo = buildReturnTo(pathname, searchParams);
    redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return session;
}
