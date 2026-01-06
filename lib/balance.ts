import { prisma } from "@/lib/db";

export async function getUserBalance(userId: string): Promise<number> {
    try {
        // First, verify user exists in database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!user) {
            console.warn(`User ${userId} not found in database`);
            return 0;
        }

        const [topup, spend] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { userId, type: "topup" },
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { userId, type: "spend" },
            }),
        ]);

        const top = topup._sum.amount ?? 0;
        const sp = spend._sum.amount ?? 0;
        return top - sp;
    } catch (error) {
        console.error("getUserBalance error:", error);
        
        // If database connection fails, return 0 instead of throwing
        // This allows the app to continue functioning
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code?: string; message?: string };
            console.error("Prisma error code:", prismaError.code);
            console.error("Prisma error message:", prismaError.message);
        }
        
        // Return 0 as fallback instead of throwing error
        return 0;
    }
}