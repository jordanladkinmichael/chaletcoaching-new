import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserBalance } from "@/lib/balance";
import { TOKEN_PACKS } from "@/lib/token-packages";

const TOKENS_PER_UNIT = Number(process.env.TOKENS_PER_UNIT) || 100;

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { transaction_guid, userId, amount, currency, planName, tokens } = body;

        if (!transaction_guid || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Calculate tokens to credit
        let tokensAdded = 0;
        if (typeof tokens === "number" && !Number.isNaN(tokens)) {
            tokensAdded = Math.max(0, Math.floor(tokens));
        } else if (amount != null && !Number.isNaN(Number(amount))) {
            tokensAdded = Math.max(0, Math.round(Number(amount) * TOKENS_PER_UNIT));
        } else {
            // Use single source of truth from token-packages.ts
            const planMap: Record<string, number> = {
                starter: TOKEN_PACKS.find(p => p.uiId === "starter")?.tokens ?? 10_000,
                builder: TOKEN_PACKS.find(p => p.uiId === "momentum")?.tokens ?? 20_000, // POPULAR
                pro: TOKEN_PACKS.find(p => p.uiId === "elite")?.tokens ?? 30_000,
            };
            if (planName && planMap[planName.toLowerCase()]) {
                tokensAdded = planMap[planName.toLowerCase()];
            } else {
                return NextResponse.json({ error: "Unable to determine tokens to credit" }, { status: 400 });
            }
        }

        if (tokensAdded <= 0) {
            return NextResponse.json({ error: "Calculated zero tokens to credit" }, { status: 400 });
        }

        // Idempotency: check if transaction with same guid was already processed
        const existing = await prisma.transaction.findFirst({
            where: {
                meta: { contains: transaction_guid },
            },
        });

        if (existing) {
            // return current balance (use getUserBalance if available)
            const balance = typeof getUserBalance === "function" ? await getUserBalance(userId) : null;
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                tokensAdded: 0,
                newBalance: balance,
            });
        }

        // Build meta as JSON string (Transaction.meta is a string in schema)
        const metaObj = {
            provider: "armenotech",
            transaction_guid,
            currency: currency ?? null,
            amountCurrency: amount ?? null,
            planName: planName ?? null,
            recordedAt: new Date().toISOString(),
        };
        const metaStr = JSON.stringify(metaObj);

        // Ensure user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Atomic create transaction + increment user.tokens
        const [, updatedUser] = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    userId,
                    amount: tokensAdded,
                    type: "topup",
                    meta: metaStr,
                },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    tokens: { increment: tokensAdded },
                },
            }),
        ]);

        // Compute new balance; prefer getUserBalance if available
        let newBalance: number | null = null;
        try {
            newBalance = typeof getUserBalance === "function" ? await getUserBalance(userId) : updatedUser.tokens;
        } catch {
            newBalance = updatedUser.tokens;
        }

        return NextResponse.json({ success: true, tokensAdded, newBalance });
    } catch (err: unknown) {
        console.error("Payment success handler error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Server error" },
            { status: 500 }
        );
    }
}
