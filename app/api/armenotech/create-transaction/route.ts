import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            amount,
            email,
            fullName,
            country = "GB",
            currency = "EUR", // default
        } = body;

        const amountNum = Number(amount);
        if (!Number.isFinite(amountNum) || amountNum <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // --- визначаємо актуальні GUID ---
        const methodUSD = process.env.ARMENOTECH_METHOD_GUID_USD;
        const methodEUR = process.env.ARMENOTECH_METHOD_GUID_EUR;
        const methodFallback = process.env.ARMENOTECH_METHOD_GUID; // старий робочий ключ

        let methodGuid: string | undefined =
            currency === "USD" ? methodUSD : methodEUR;

        // якщо в .env немає нового — одразу fallback
        if (!methodGuid) {
            console.warn(`⚠️ Missing ${currency} GUID, using fallback key.`);
            methodGuid = methodFallback;
        }

        if (!methodGuid) {
            return NextResponse.json(
                { error: "No valid Armenotech method GUID configured" },
                { status: 500 }
            );
        }

        const payload = {
            amount: amountNum,
            currency,
            fields: {
                transaction: {
                    deposit_method: methodGuid,
                    deposit: {
                        asset_code: currency, // додаємо asset_code
                        redirect_url: process.env.ARMENOTECH_RETURN_URL,
                        fail_url: process.env.ARMENOTECH_FAIL_URL,
                        status_callback_url: process.env.ARMENOTECH_STATUS_CALLBACK_URL,
                        external_id: `order_${Date.now()}`,
                        from_email: email,
                        from_first_name: fullName?.split(" ")[0] || "",
                        from_last_name: fullName?.split(" ")[1] || "",
                        from_country: country,
                        referer_domain: "chaletcoaching.co.uk",
                        locale_lang: "en",
                    },
                },
            },
        };

        console.log(`💳 Creating ${currency} transaction via ${methodGuid}`);

        const createTransaction = async (guid: string) => {
            payload.fields.transaction.deposit_method = guid;
            const res = await fetch(
                `${process.env.ARMENOTECH_BASE_URL}/${process.env.ARMENOTECH_MERCHANT_GUID}/transactions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-App-Token": process.env.ARMENOTECH_APP_TOKEN || "",
                        "X-App-Secret": process.env.ARMENOTECH_APP_SECRET || "",
                    },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json().catch(() => ({}));
            return { res, data };
        };

        // перша спроба
        let { res, data } = await createTransaction(methodGuid);

        // fallback 1: якщо помилка з asset
        if (
            !res.ok &&
            /(asset not found|create sep0031|invalid asset|internal error)/i.test(
                String(data?.message || data?.error || "")
            )
        ) {
            console.warn("⚠️ Retrying with fallback method GUID...");
            if (methodFallback && methodFallback !== methodGuid) {
                ({ res, data } = await createTransaction(methodFallback));
            }
        }

        // fallback 2: якщо і після цього не вийшло — пробуємо старий ключ останній раз
        if (!res.ok && methodFallback && methodFallback !== methodGuid) {
            console.warn("⚠️ Final retry with legacy method key...");
            ({ res, data } = await createTransaction(methodFallback));
        }

        if (!res.ok) {
            console.error("❌ Armenotech error:", data);
            return NextResponse.json(
                { error: data.message || "Payment failed", details: data },
                { status: res.status || 500 }
            );
        }

        return NextResponse.json({
            redirect: data.how || data.redirect || data.redirect_url,
            id: data.id,
        });
    } catch (err) {
        console.error("Transaction error:", err);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
