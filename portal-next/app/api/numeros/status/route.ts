import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instance = searchParams.get('instance');

  if (!instance) {
    return NextResponse.json({ error: 'instance param required' }, { status: 400 });
  }

  try {
    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;

    if (!evoUrl || !evoKey) {
      return NextResponse.json({ error: 'Evolution API not configured' }, { status: 500 });
    }

    const res = await fetch(
      `${evoUrl}/instance/connectionState/${encodeURIComponent(instance)}`,
      {
        headers: {
          apikey: evoKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ status: 'unknown', error: `Evolution API: ${res.status}` });
    }

    const data = await res.json();
    // Evolution API returns { instance: { state: "open" | "connecting" | "close" } }
    const state = data?.instance?.state ?? data?.state ?? 'unknown';

    return NextResponse.json({ status: state });
  } catch (err) {
    console.error('Status check error:', err);
    return NextResponse.json({ status: 'unknown', error: 'timeout or connection error' });
  }
}
