import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

interface BaseQuote {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastDirection: 'up' | 'down' | 'neutral';
  unit: string;
  high: number;
  low: number;
}

const BASE_COMMODITY_QUOTES: BaseQuote[] = [
  {
    symbol: 'USD/BRL',
    name: 'Dólar Comercial PTAX',
    price: 5.75,
    change24h: 0.15,
    lastDirection: 'neutral',
    unit: 'R$',
    high: 5.78,
    low: 5.72,
  },
  {
    symbol: 'SOJA-PR',
    name: 'Soja Paranaguá (FOB)',
    price: 138.5,
    change24h: -0.42,
    lastDirection: 'neutral',
    unit: 'R$/sc',
    high: 140.2,
    low: 137.8,
  },
  {
    symbol: 'SOJA-CBOT',
    name: 'Soja Chicago (CBOT)',
    price: 1042.5,
    change24h: 0.85,
    lastDirection: 'neutral',
    unit: '¢/bu',
    high: 1055.0,
    low: 1038.0,
  },
  {
    symbol: 'MILHO-B3',
    name: 'Milho Futuro B3 (CCM)',
    price: 63.8,
    change24h: 1.12,
    lastDirection: 'neutral',
    unit: 'R$/sc',
    high: 64.5,
    low: 62.9,
  },
];

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // Tenta buscar cotação recente real do USD da AwesomeAPI antes de iniciar o stream
  let currentUsd = 5.75;
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      const bid = parseFloat(data.USDBRL?.bid);
      if (!isNaN(bid)) currentUsd = bid;
    }
  } catch {
    // Fallback silencioso para cotação base
  }

  const quotesState = BASE_COMMODITY_QUOTES.map((q) => {
    if (q.symbol === 'USD/BRL') {
      return { ...q, price: currentUsd };
    }
    return { ...q };
  });

  const stream = new ReadableStream({
    start(controller) {
      // 1. Envia payload inicial
      const initialPayload = `data: ${JSON.stringify({
        type: 'INITIAL_QUOTES',
        timestamp: new Date().toISOString(),
        quotes: quotesState,
      })}\n\n`;
      controller.enqueue(encoder.encode(initialPayload));

      // 2. Ticks periódicos de micro-variação estocástica (a cada 4 segundos)
      const intervalId = setInterval(() => {
        try {
          // Seleciona uma commodity aleatória para atualizar
          const targetIndex = Math.floor(Math.random() * quotesState.length);
          const target = quotesState[targetIndex];

          // Choque estocástico gaussiano leve (-0.3% a +0.3%)
          const pctShock = (Math.random() - 0.49) * 0.006;
          const oldPrice = target.price;
          const newPrice = Number((oldPrice * (1 + pctShock)).toFixed(target.symbol === 'USD/BRL' ? 4 : 2));
          const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'neutral';

          target.price = newPrice;
          target.lastDirection = direction;
          target.high = Math.max(target.high, newPrice);
          target.low = Math.min(target.low, newPrice);

          const tickPayload = `data: ${JSON.stringify({
            type: 'TICK',
            timestamp: new Date().toISOString(),
            quote: target,
          })}\n\n`;

          controller.enqueue(encoder.encode(tickPayload));
        } catch {
          clearInterval(intervalId);
          controller.close();
        }
      }, 4000);

      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
