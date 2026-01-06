import { prisma } from "@/lib/db";

export async function createTransactionAndAdjustBalance(userId: string, type: "topup" | "spend", amount: number, meta?: object) {
    // Ensure amount is a valid integer for Prisma Int type
    const amountAsInt = Math.floor(Math.max(0, amount));
    if (amountAsInt <= 0) {
        throw new Error("Invalid transaction amount");
    }

    // Use prisma.$transaction to ensure both ops succeed or fail together
    return await prisma.$transaction(async (tx) => {
        await tx.transaction.create({
            data: {
                userId,
                type,
                amount: amountAsInt, // Ensure it's an integer for Prisma Int type
                meta: meta ? JSON.stringify(meta) : undefined,
            },
        });
        await tx.user.update({
            where: { id: userId },
            data: { tokens: { increment: type === "topup" ? amountAsInt : -amountAsInt } },
        });
    });
}
