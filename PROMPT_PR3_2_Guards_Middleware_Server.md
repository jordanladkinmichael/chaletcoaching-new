# PR 3.2 — Guards (Middleware + Server Guard) for /dashboard and /account — Cursor-ready prompt

You are working in an existing **Next.js App Router** project that already uses:
- NextAuth v4
- Session strategy: JWT
- Credentials provider (email/password)
- Prisma + Neon

This PR must implement **route protection (guards)** for private areas:
- `/dashboard` — auth only
- `/account` — auth only

Keep the PR focused. Do **not** change generator logic in this PR.

---

## 0) Non‑negotiable constraints

1) **Redirect UX**
- If a guest visits a protected route, redirect to:
  - `/auth/sign-in?returnTo=<originalPathAndQuery>`
- After sign-in, user returns to `returnTo`.

2) **No modals**
- Only page redirects.

3) **Do not break public pages**
- `/` and all marketing pages remain public.
- `/generator` remains public (actions gated later).

4) **Edge-safe middleware**
- Middleware must run in Edge runtime. Do not use Node-only modules (bcrypt, prisma client).

5) **Preserve Home layout consistency**
- If you create any new page stubs for testing, use the same Home width container + SiteHeader/SiteFooter.

---

## 1) Implementation strategy (required)

Use **both**:
1) **Middleware** (primary UX gate)
2) **Server guard** inside the protected pages (secondary safety gate)

Reason: middleware improves UX, server guard prevents bypass in edge cases.

---

## 2) Middleware implementation

### 2.1 Create `middleware.ts` at project root
Use `getToken` from `next-auth/jwt` to check auth in Edge safely.

Pseudo-logic:
- Determine if request is for a protected path:
  - `/dashboard` or `/dashboard/...`
  - `/account` or `/account/...`
- If protected and no token:
  - Build `returnTo` from `req.nextUrl.pathname + req.nextUrl.search`
  - Redirect to `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
- Else: continue

### 2.2 Matcher
Configure middleware matcher to only run on protected routes (recommended):

```ts
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
```

This prevents accidental slowdowns on the rest of the site.

### 2.3 Secret
Use the same secret as NextAuth:
- `process.env.NEXTAUTH_SECRET`

Example check:
```ts
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
```

If token exists => user is authenticated.

---

## 3) Server guard inside pages

Add server-side protection in:
- `app/dashboard/page.tsx`
- `app/account/page.tsx` (even if it is a temporary stub)

### 3.1 How to guard
Use `getServerSession` + existing `authOptions` (do not refactor auth config).

If session is missing:
- Redirect to `/auth/sign-in?returnTo=/dashboard` (or `/account`)
- Include query params if present (optional)

Use `redirect()` from `next/navigation`.

### 3.2 Helper (optional but clean)
If the project does not already have a helper, create a small one:

- `lib/auth/require-session.ts`

```ts
export async function requireSession(returnTo: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  return session;
}
```

Use it in both pages to avoid duplication.

---

## 4) /account page availability (for testing)
If `/account` does not exist yet, create a minimal placeholder page **in this PR** so the guard can be tested:

- H1: `Account`
- One neutral card: `Account settings will appear here.`
- Must use Home-width container + header/footer.

No settings logic yet. That comes later.

---

## 5) Acceptance criteria (DoD)

### Functional
- Guest visiting `/dashboard` is redirected to `/auth/sign-in?returnTo=/dashboard`
- Guest visiting `/account` is redirected to `/auth/sign-in?returnTo=/account`
- Authenticated user can open both routes normally.
- Redirect preserves querystring:
  - `/dashboard?tab=tokens` -> `returnTo=/dashboard?tab=tokens`

### Safety
- Middleware uses only edge-safe APIs (`getToken`, `NextResponse`, `NextRequest`)
- Server guard exists inside the pages (middleware is not the only lock)

### Non-regression
- Public pages (Home, /coaches, /pricing, /generator) remain accessible as a guest.

---

## 6) Manual test plan
1) Log out. Open `/dashboard`.
   - Must redirect to sign-in with `returnTo=/dashboard`.
2) Complete sign-in.
   - Must land back on `/dashboard`.
3) Log out. Open `/account?x=1`.
   - Must redirect to sign-in with `returnTo=/account?x=1`.
4) Sign in.
   - Must land on `/account?x=1`.
5) Verify `/generator` still opens for guests.

---

## 7) Keep PR small
Do not implement:
- generator action gating
- dashboard content changes
- token logic changes
Those are next PRs.
