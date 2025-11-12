import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { TOKEN_PACKAGES, TokenPackageId, getPackagePrice, Currency } from "@/lib/payment";

// ✅ Validation schema
const TopupSchema = z.object({
    packageId: z.enum(["STARTER", "POPULAR", "PRO", "ENTERPRISE"] as const),
    currency: z.enum(["EUR", "GBP", "USD"]).default("EUR"),
    amount: z.string().optional(), // for custom payments
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { packageId, currency, amount } = TopupSchema.parse(body);

        // ✅ get token package
        const tokenPackage = TOKEN_PACKAGES[packageId];
        if (!tokenPackage) {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        let tokensToCredit: number = tokenPackage.tokens as number;
        let price: number = getPackagePrice(packageId, currency as Currency) as number;

        // ✅ handle ENTERPRISE (custom) plan
        if (packageId === "ENTERPRISE") {
            const numericAmount = Number(amount);
            if (!isNaN(numericAmount) && numericAmount > 0) {
                price = numericAmount;

                // Find which tier this amount corresponds to
                if (numericAmount <= TOKEN_PACKAGES.STARTER.price) {
                    tokensToCredit = TOKEN_PACKAGES.STARTER.tokens;
                } else if (numericAmount <= TOKEN_PACKAGES.POPULAR.price) {
                    tokensToCredit = TOKEN_PACKAGES.POPULAR.tokens;
                } else if (numericAmount <= TOKEN_PACKAGES.PRO.price) {
                    tokensToCredit = TOKEN_PACKAGES.PRO.tokens;
                } else {
                    // For larger custom payments, estimate proportionally
                    const baseRate = TOKEN_PACKAGES.PRO.tokens / TOKEN_PACKAGES.PRO.price;
                    tokensToCredit = Math.round(numericAmount * baseRate);
                }
            } else {
                return NextResponse.json({ error: "Invalid custom amount" }, { status: 400 });
            }
        }

        // ✅ Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId: session.user.id,
                type: "topup",
                amount: tokensToCredit,
                meta: JSON.stringify({
                    packageId,
                    packageName: tokenPackage.name,
                    price,
                    currency,
                    tokensCredited: tokensToCredit,
                    processedAt: new Date().toISOString(),
                    method: "auto_payment",
                }),
            },
        });

        // ✅ Calculate total user balance
        const balanceResult = await prisma.transaction.aggregate({
            where: { userId: session.user.id },
            _sum: { amount: true },
        });

        const newBalance = balanceResult._sum.amount ?? 0;

        return NextResponse.json({
            success: true,
            transactionId: transaction.id,
            tokensAdded: tokensToCredit,
            newBalance,
            package: {
                id: packageId,
                name: tokenPackage.name,
                price,
                currency,
                tokens: tokensToCredit,
            },
        });
    } catch (error) {
        console.error("💥 Token top-up error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to process token top-up" },
            { status: 500 }
        );
    }
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
