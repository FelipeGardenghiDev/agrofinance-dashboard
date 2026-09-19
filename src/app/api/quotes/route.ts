import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface AwesomeApiResponse {
  USDBRL?: {
    code: string;
    codein: string;
    name: string;
    bid: string;
    ask: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    create_date: string;
  };
}

export async function GET() {
  const fallbackQuote = {
    symbol: 'USD/BRL',
    name: 'Dólar Comercial PTAX',
    price: 5.75,
    change24h: 0.15,
    high: 5.78,
    low: 5.72,
    unit: 'R$',
    isLiveExternal: false,
    updatedAt: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`AwesomeAPI responded with status: ${res.status}`);
    }

    const data = (await res.json()) as AwesomeApiResponse;
    const usd = data.USDBRL;

    if (!usd || !usd.bid) {
      throw new Error('Malformed quote data received from external market provider');
    }

    const price = parseFloat(usd.bid);
    const change24h = parseFloat(usd.pctChange);

    return NextResponse.json({
      success: true,
      source: 'AwesomeAPI (Banco Central do Brasil / B3 PTAX)',
      isLiveExternal: true,
      data: {
        symbol: 'USD/BRL',
        name: 'Dólar Comercial PTAX',
        price: isNaN(price) ? fallbackQuote.price : price,
        change24h: isNaN(change24h) ? fallbackQuote.change24h : change24h,
        high: parseFloat(usd.high) || price,
        low: parseFloat(usd.low) || price,
        unit: 'R$',
        updatedAt: usd.create_date || new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      source: 'Fallback Cache (Local AgroFinance Resilience)',
      isLiveExternal: false,
      error: error instanceof Error ? error.message : 'Unknown network error',
      data: fallbackQuote,
    });
  }
}
