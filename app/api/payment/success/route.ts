import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Legacy payment endpoint is disabled. Use CardServ checkout flow.",
      redirectTo: "/pricing",
    },
    { status: 410 },
  );
}
