import { prisma } from "@/lib/db";

export async function getUserBalance(userId: string): Promise<number> {
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
}