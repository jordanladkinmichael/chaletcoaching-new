import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentService } from '@/lib/payment-providers';
import { getTokenPackage, getPackagePrice, TokenPackageId, Currency } from '@/lib/payment';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { packageId, currency = 'EUR' } = body as { packageId: TokenPackageId; currency?: Currency };

  const pkg = getTokenPackage(packageId);
  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  }

  const providerName = process.env.PAYMENT_PROVIDER || 'none';
  if (!providerName || providerName === 'none') {
    return NextResponse.json({ error: 'No payment provider configured' }, { status: 501 });
  }

  try {
    const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? '';
    const service = new PaymentService(providerName);
    const result = await service.createPaymentSession({
      userId: session.user.id,
      amount: getPackagePrice(packageId, currency),
      currency: currency.toLowerCase(),
      tokens: pkg.tokens,
      packageName: pkg.name,
      successUrl: `${origin}/?success=true`,
      cancelUrl: `${origin}/?canceled=true`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: result.sessionId, paymentUrl: result.paymentUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

