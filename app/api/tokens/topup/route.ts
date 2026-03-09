import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { TOKEN_PACKAGES, TokenPackageId } from "@/lib/payment";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  void req;
  return NextResponse.json(
    {
      error: "Direct top-up is disabled. Please complete payment via checkout.",
      redirectTo: "/pricing",
    },
    { status: 410 }
  );
}

// ✅ GET available packages
export async function GET() {
  try {
    const packages = Object.entries(TOKEN_PACKAGES).map(([id, data]) => ({
      id: id as TokenPackageId,
      ...data,
    }));

    return NextResponse.json({
      packages,
      currencies: ["EUR", "GBP", "USD"],
    });
  } catch (error) {
    console.error("Error fetching token packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
