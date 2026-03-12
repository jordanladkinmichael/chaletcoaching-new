const requestorId = process.env.CARDSERV_SANDBOX_REQUESTOR_ID || "853";
const token = process.env.CARDSERV_SANDBOX_TOKEN;
const baseUrl = process.env.CARDSERV_SANDBOX_BASE_URL || "https://test.cardserv.io";

if (!token) {
  console.error("Missing CARDSERV_SANDBOX_TOKEN");
  process.exit(1);
}

const cards = [
  { label: "non3ds-approved", pan: "5555444433331111", cvv: "123" },
  { label: "non3ds-declined", pan: "5555444433331111", cvv: "555" },
  { label: "3ds1-pareq", pan: "4444444411111111", cvv: "872" },
  { label: "3ds2-frictionless-approved", pan: "4444444444444422", cvv: "123" },
  { label: "3ds2-frictionless-declined", pan: "4444444444444455", cvv: "123" },
];

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${response.status}): ${text.slice(0, 400)}`);
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

async function runCard(card) {
  const orderMerchantId = `smoke_${card.label}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const saleBody = {
    order: {
      orderMerchantId,
      orderDescription: `Sandbox smoke: ${card.label}`,
      orderAmount: "1.00",
      orderCurrencyCode: "EUR",
    },
    browser: {
      ipAddress: "2.58.95.68",
      acceptHeader:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      colorDepth: 32,
      javascriptEnabled: "true",
      acceptLanguage: "en-US",
      screenHeight: 1080,
      screenWidth: 1920,
      timeZone: -180,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      javaEnabled: "false",
    },
    customer: {
      firstname: "IVANKO",
      lastname: "BUZINA",
      customerPhone: 3489262289,
      birthBirthday: "1982.01.01",
      customerEmail: "s.a.l.e.s@stripe.com",
      address: {
        countryCode: "IT",
        zipCode: "30342",
        city: "Atlanta",
        line1: "Two Premier Plaza",
        line2: "5607 Glenridge Drive",
      },
    },
    card: {
      cardNumber: card.pan,
      cvv2: card.cvv,
      expireMonth: "10",
      expireYear: "2026",
      cardPrintedName: "IVANKO BUZINA",
    },
    urls: {
      resultUrl: "https://httpbin.org/anything",
      webhookUrl: "https://webhook.site/57d1aa8d-04e9-45d5-8ca6-4d05273791d3",
    },
  };

  const sale = await postJson(`${baseUrl}/api/payments/sale/${requestorId}`, saleBody);
  const snapshots = [];

  for (const delayMs of [1500, 3000, 5000]) {
    await sleep(delayMs);
    const status = await postJson(`${baseUrl}/api/payments/status/${requestorId}`, {
      orderMerchantId,
      orderSystemId: sale.data.orderSystemId,
    });

    snapshots.push({
      delayMs,
      state: status.data.orderState,
      redirectUrl: status.data.outputRedirectToUrl || null,
      authStep: status.data.threeDSAuth?.threeDSAuthStep || null,
      errorCode: status.data.errorCode || null,
      errorMessage: status.data.errorMessage || null,
    });

    if (["APPROVED", "DECLINED", "ERROR", "FILTERED", "CHAIN_STEP"].includes(status.data.orderState)) {
      break;
    }
    if (status.data.outputRedirectToUrl || status.data.threeDSAuth) {
      break;
    }
  }

  return {
    label: card.label,
    orderMerchantId,
    saleState: sale.data.orderState,
    orderSystemId: sale.data.orderSystemId,
    snapshots,
  };
}

async function main() {
  for (const card of cards) {
    const result = await runCard(card);
    console.log(JSON.stringify(result));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
