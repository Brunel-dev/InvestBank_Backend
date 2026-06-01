import React, { useEffect, useRef, useState } from 'react';

interface Candle {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  t: number; // timestamp
}

interface Props {
  basePrice: number;
  active: boolean;
  height?: number;
}

const MAX_CANDLES = 60;

/**
 * Génère une variation pseudo-aléatoire centrée sur 0 avec une légère tendance haussière
 * lorsque le scalping est actif.
 */
const nextStep = (prev: number, biased: boolean) => {
  const volatility = prev * 0.0025; // 0.25% par tick
  const drift = biased ? prev * 0.0008 : 0;
  return prev + drift + (Math.random() - 0.5) * 2 * volatility;
};

const TradingChart: React.FC<Props> = ({ basePrice, active, height = 260 }) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const lastPriceRef = useRef<number>(basePrice);
  const tickRef = useRef<{ open: number; high: number; low: number; close: number; ticks: number } | null>(null);

  // re-init when basePrice changes (start of scalping)
  useEffect(() => {
    lastPriceRef.current = basePrice;
    setCandles([]);
    tickRef.current = null;
  }, [basePrice]);

  useEffect(() => {
    const id = setInterval(() => {
      const last = lastPriceRef.current;
      const next = nextStep(last, active);
      lastPriceRef.current = next;

      const cur = tickRef.current;
      if (!cur) {
        tickRef.current = { open: last, high: Math.max(last, next), low: Math.min(last, next), close: next, ticks: 1 };
      } else {
        cur.high = Math.max(cur.high, next);
        cur.low = Math.min(cur.low, next);
        cur.close = next;
        cur.ticks += 1;
      }

      // close a candle every 5 ticks (~5s)
      if (tickRef.current && tickRef.current.ticks >= 5) {
        const c: Candle = {
          o: tickRef.current.open,
          h: tickRef.current.high,
          l: tickRef.current.low,
          c: tickRef.current.close,
          t: Date.now(),
        };
        setCandles((arr) => {
          const next = [...arr, c];
          return next.slice(-MAX_CANDLES);
        });
        tickRef.current = null;
      } else {
        // force re-render to animate live candle
        setCandles((arr) => [...arr]);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const live = tickRef.current
    ? { o: tickRef.current.open, h: tickRef.current.high, l: tickRef.current.low, c: tickRef.current.close, t: Date.now() }
    : null;
  const allCandles = live ? [...candles, live] : candles;

  if (allCandles.length === 0) {
    return (
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-sm"
        style={{ height }}
      >
        Initialisation du flux de marché...
      </div>
    );
  }

  const width = 800;
  const padding = 30;
  const allValues = allCandles.flatMap((c) => [c.h, c.l]);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yRange = Math.max(0.0001, yMax - yMin);
  const cw = (width - padding * 2) / MAX_CANDLES;

  const scaleY = (v: number) => padding + ((yMax - v) / yRange) * (height - padding * 2);
  const scaleX = (i: number) => padding + i * cw + cw / 2;

  const currentPrice = lastPriceRef.current;
  const firstPrice = allCandles[0].o;
  const variation = ((currentPrice - firstPrice) / firstPrice) * 100;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">USDT / USD</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
            {active ? '● LIVE' : 'Inactif'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Prix :</span>
          <span className="font-mono text-white">{currentPrice.toFixed(4)}</span>
          <span className={variation >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {variation >= 0 ? '+' : ''}{variation.toFixed(2)}%
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={padding}
            x2={width - padding}
            y1={padding + p * (height - padding * 2)}
            y2={padding + p * (height - padding * 2)}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
        ))}
        {/* y labels */}
        {[yMax, yMin + yRange / 2, yMin].map((v, i) => (
          <text
            key={i}
            x={width - padding + 4}
            y={padding + (i * (height - padding * 2)) / 2 + 4}
            fontSize="10"
            fill="#64748b"
          >
            {v.toFixed(4)}
          </text>
        ))}
        {/* candles */}
        {allCandles.map((c, i) => {
          const x = scaleX(i);
          const bullish = c.c >= c.o;
          const color = bullish ? '#10b981' : '#ef4444';
          const bodyTop = scaleY(Math.max(c.o, c.c));
          const bodyBottom = scaleY(Math.min(c.o, c.c));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          const bodyWidth = Math.max(2, cw * 0.6);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={scaleY(c.h)} y2={scaleY(c.l)} stroke={color} strokeWidth="1" />
              <rect
                x={x - bodyWidth / 2}
                y={bodyTop}
                width={bodyWidth}
                height={bodyHeight}
                fill={color}
                opacity={i === allCandles.length - 1 ? 0.85 : 0.7}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TradingChart;
