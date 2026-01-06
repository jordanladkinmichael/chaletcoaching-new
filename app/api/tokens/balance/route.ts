import { NextResponse } from "next/server";
import { getUserBalance } from "@/lib/balance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // getUserBalance now handles errors internally and returns 0 on failure
        // This prevents 500 errors and allows the app to continue functioning
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

        // Return balance 0 instead of error to prevent breaking the UI
        // The error is already logged for debugging
        return NextResponse.json({ balance: 0 });
    }
}
