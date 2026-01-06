import { NextResponse } from "next/server";
import { getUserBalance } from "@/lib/balance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const balance = await getUserBalance(session.user.id);
        return NextResponse.json({ balance });
    } catch (err: unknown) {
        console.error("balance API error:", err);
        
        // More detailed error logging
        if (err instanceof Error) {
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);
            console.error("Error stack:", err.stack);
        }

        // Check for Prisma errors
        if (err && typeof err === 'object' && 'code' in err) {
            console.error("Prisma error code:", (err as { code?: string }).code);
        }

        return NextResponse.json(
            { 
                error: "Failed to fetch balance",
                message: err instanceof Error ? err.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
